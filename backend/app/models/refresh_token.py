import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


def refresh_token_digest(plain: str) -> str:
    return hashlib.sha256(plain.encode("utf-8")).hexdigest()


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(128), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)
    long_lived = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")

    @staticmethod
    def create_plain_token() -> str:
        return secrets.token_urlsafe(48)

    @classmethod
    def issue_for_user(
        cls, db, user_id: int, days: int, long_lived: bool = True
    ) -> tuple["RefreshToken", str]:
        plain = cls.create_plain_token()
        digest = refresh_token_digest(plain)
        row = cls(
            user_id=user_id,
            token_hash=digest,
            expires_at=datetime.now(timezone.utc) + timedelta(days=days),
            long_lived=long_lived,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row, plain

    @classmethod
    def find_valid(cls, db, plain: str):
        if not plain:
            return None
        digest = refresh_token_digest(plain)
        return (
            db.query(cls)
            .filter(
                cls.token_hash == digest,
                cls.revoked == False,
                cls.expires_at > datetime.now(timezone.utc),
            )
            .first()
        )
