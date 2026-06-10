from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Skill, Resume
from ..schemas import SkillResponse, SkillUpdate
from ..auth import get_current_user
from ..services.ai_service import ai_service, ROLE_SKILL_MAPS

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("", response_model=List[SkillResponse])
def get_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    # If empty, let's prepopulate default gaps for their target role to make dashboard immediate
    if not skills and current_user.target_role:
        role_skills = ROLE_SKILL_MAPS.get(current_user.target_role, ["Python", "SQL", "Git"])
        for s in role_skills:
            db_skill = Skill(user_id=current_user.id, name=s, status="gap", category="Core Requirements")
            db.add(db_skill)
        db.commit()
        skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    return skills

@router.post("/gap-analysis")
def analyze_gaps(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a target role before analyzing skill gaps."
        )

    # Get latest resume
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    resume_text = latest_resume.raw_text if latest_resume else ""
    
    # Run gap analysis
    analysis = ai_service.analyze_skill_gaps(resume_text, current_user.target_role)
    
    # Clear old skills and insert fresh
    db.query(Skill).filter(Skill.user_id == current_user.id).delete()
    
    mastered = analysis.get("mastered_skills", [])
    missing = analysis.get("missing_skills", [])
    
    for skill_name in mastered:
        db.add(Skill(user_id=current_user.id, name=skill_name, status="mastered", category="Mastered Skills"))
    for skill_name in missing:
        db.add(Skill(user_id=current_user.id, name=skill_name, status="gap", category="Missing Gaps"))
        
    current_user.readiness_score = analysis.get("readiness_percentage", 0)
    db.commit()
    
    return {
        "readiness_score": current_user.readiness_score,
        "mastered_skills": mastered,
        "missing_skills": missing,
        "category_gaps": analysis.get("category_gaps", {})
    }

@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, skill_update: SkillUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    skill.status = skill_update.status
    db.commit()
    db.refresh(skill)
    
    # Recalculate readiness score based on simple math
    all_skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    if all_skills:
        mastered_count = sum(1 for s in all_skills if s.status == "mastered")
        current_user.readiness_score = int((mastered_count / len(all_skills)) * 100)
        db.commit()

    return skill
