from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Body, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.database import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    is_trial: bool = False


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None
    expires_in: int  # seconds


class RefreshIn(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    avatar_url: str | None = None
    target_role: str | None = None
    is_trial_user: bool = False
    trial_start_date: Any | None = None
    trial_end_date: Any | None = None
    subscription_type: str = "free"
    theme: str = "dark"

    class Config:
        from_attributes = True


def _revoke_user_refresh_tokens(db: Session, user_id: int) -> None:
    for row in db.query(RefreshToken).filter(RefreshToken.user_id == user_id).all():
        row.revoked = True
    db.commit()


@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    from datetime import datetime, timedelta, timezone

    is_trial_user = user_in.is_trial
    trial_start_date = datetime.now(timezone.utc) if is_trial_user else None
    trial_end_date = (
        datetime.now(timezone.utc) + timedelta(days=3) if is_trial_user else None
    )
    subscription_type = "trial" if is_trial_user else "free"

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        is_trial_user=is_trial_user,
        trial_start_date=trial_start_date,
        trial_end_date=trial_end_date,
        subscription_type=subscription_type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    remember_me: bool = Form(False),
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect Password")

    if remember_me:
        access_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES_REMEMBER)
        refresh_days = settings.REFRESH_TOKEN_EXPIRE_DAYS_REMEMBER
    else:
        access_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES_SESSION)
        refresh_days = settings.REFRESH_TOKEN_EXPIRE_DAYS_SESSION

    access = create_access_token(user.id, expires_delta=access_delta)
    _revoke_user_refresh_tokens(db, user.id)
    _, plain_refresh = RefreshToken.issue_for_user(
        db, user.id, days=refresh_days, long_lived=remember_me
    )

    return {
        "access_token": access,
        "refresh_token": plain_refresh,
        "expires_in": int(access_delta.total_seconds()),
    }


@router.post("/refresh", response_model=TokenOut)
def refresh_tokens(payload: RefreshIn, db: Session = Depends(get_db)) -> Any:
    row = RefreshToken.find_valid(db, payload.refresh_token)
    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == row.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    row.revoked = True
    db.commit()

    access_delta = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES_REMEMBER
        if row.long_lived
        else settings.ACCESS_TOKEN_EXPIRE_MINUTES_SESSION
    )
    new_access = create_access_token(user.id, expires_delta=access_delta)
    refresh_days = (
        settings.REFRESH_TOKEN_EXPIRE_DAYS_REMEMBER
        if row.long_lived
        else settings.REFRESH_TOKEN_EXPIRE_DAYS_SESSION
    )
    _, new_refresh = RefreshToken.issue_for_user(
        db, user.id, days=refresh_days, long_lived=row.long_lived
    )

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "expires_in": int(access_delta.total_seconds()),
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
    first_name: str | None = Body(None),
    last_name: str | None = Body(None),
    email: EmailStr | None = Body(None),
    avatar_url: str | None = Body(None),
    target_role: str | None = Body(None),
    theme: str | None = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if first_name is not None:
        current_user.first_name = first_name
    if last_name is not None:
        current_user.last_name = last_name
    if email is not None:
        current_user.email = email
    if avatar_url is not None:
        current_user.avatar_url = avatar_url
    if target_role is not None:
        current_user.target_role = target_role
    if theme is not None and theme in ("dark", "light"):
        current_user.theme = theme
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/logout")
def logout(
    payload: RefreshIn | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    if payload and payload.refresh_token:
        row = RefreshToken.find_valid(db, payload.refresh_token)
        if row and row.user_id == current_user.id:
            row.revoked = True
            db.commit()
    else:
        _revoke_user_refresh_tokens(db, current_user.id)
    return {"status": "ok"}
