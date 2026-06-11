import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Resume, Skill
from ..schemas import ResumeResponse
from ..auth import get_current_user
from ..services.pdf_service import extract_text_from_pdf
from ..services.ai_service import ai_service
from ..services.vector_service import vector_service

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currently, only PDF format resumes are supported."
        )
        
    try:
        # 1. Read file bytes and parse PDF text
        file_bytes = await file.read()
        extracted_text = extract_text_from_pdf(file_bytes)
        
        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Extracted text is empty. Make sure your PDF is not just a scanned image."
            )
            
        # 2. Call AI services to evaluate resume
        target_role = current_user.target_role or "AI Engineer"
        analysis = ai_service.analyze_resume(extracted_text, target_role)
        
        # 3. Store in Postgres/SQLite database
        new_resume = Resume(
            user_id=current_user.id,
            file_name=file.filename,
            ats_score=analysis.get("ats_score", 0),
            raw_text=extracted_text,
            feedback_json=json.dumps(analysis)
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        
        # 4. Insert into local Vector DB (ChromaDB) for RAG context
        # vector_service.add_document(
        #     doc_id=f"resume_{current_user.id}_{new_resume.id}",
        #     text=extracted_text,
        #     metadata={
        #         "user_id": current_user.id,
        #         "type": "resume",
        #         "file_name": file.filename
        #     }
        # )
        
        # 5. Automatically sync skill gaps
        gaps_analysis = ai_service.analyze_skill_gaps(extracted_text, target_role)
        db.query(Skill).filter(Skill.user_id == current_user.id).delete()
        
        mastered = gaps_analysis.get("mastered_skills", [])
        missing = gaps_analysis.get("missing_skills", [])
        
        for s in mastered:
            db.add(Skill(user_id=current_user.id, name=s, status="mastered", category="Mastered Core"))
        for s in missing:
            db.add(Skill(user_id=current_user.id, name=s, status="gap", category="Missing Gaps"))
            
        current_user.readiness_score = gaps_analysis.get("readiness_percentage", analysis.get("ats_score", 50))
        db.commit()
        
        return {
            "id": new_resume.id,
            "file_name": new_resume.file_name,
            "ats_score": new_resume.ats_score,
            "feedback": analysis,
            "skills_sync": {
                "readiness_percentage": current_user.readiness_score,
                "mastered": mastered,
                "missing": missing
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing resume: {str(e)}"
        )

@router.get("/history", response_model=List[ResumeResponse])
def get_resume_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return resumes
