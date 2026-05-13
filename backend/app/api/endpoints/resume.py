import json

from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.resume import Resume
from app.api.deps import get_current_user
from app.models.user import User
from app.agents.resume_agent import ResumeAnalyzerAgent

router = APIRouter()
analyzer = ResumeAnalyzerAgent()


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form("Software Engineer"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf") and not file.filename.endswith(".docx"):
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are supported"
        )

    try:
        content = await file.read()
        if file.filename.endswith(".pdf"):
            parsed_text = analyzer.parse_pdf(content)
        else:
            parsed_text = analyzer.parse_docx(content)

        analysis_result = analyzer.analyze_resume(parsed_text, target_role)

        resume_record = Resume(
            user_id=current_user.id,
            filename=file.filename,
            parsed_text=parsed_text[:20000],
            ats_score=analysis_result.get("ats_score", 0),
            target_role=target_role,
            analysis_json=json.dumps(analysis_result),
        )
        db.add(resume_record)
        db.commit()

        return {
            "status": "success",
            "filename": file.filename,
            "parsed_length": len(parsed_text),
            "analysis": analysis_result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
