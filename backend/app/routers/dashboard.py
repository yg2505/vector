from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Skill, RoadmapTask
from ..schemas import DashboardSummary
from ..auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Fetch and segment skills
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    mastered = sum(1 for s in skills if s.status == "mastered")
    learning = sum(1 for s in skills if s.status == "learning")
    gap = sum(1 for s in skills if s.status == "gap")
    
    # 2. Roadmap completion percentage
    tasks = db.query(RoadmapTask).filter(RoadmapTask.user_id == current_user.id).all()
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    
    completion_pct = 0.0
    if total_tasks > 0:
        completion_pct = round((completed_tasks / total_tasks) * 100, 1)
        
    # 3. Retrieve next 3 upcoming tasks
    upcoming = db.query(RoadmapTask).filter(
        RoadmapTask.user_id == current_user.id,
        RoadmapTask.status != "completed"
    ).order_by(RoadmapTask.week_number.asc()).limit(3).all()
    
    return {
        "full_name": current_user.full_name,
        "target_role": current_user.target_role,
        "career_goal": current_user.career_goal,
        "readiness_score": current_user.readiness_score,
        "learning_streak": current_user.learning_streak,
        "skills_mastered_count": mastered,
        "skills_learning_count": learning,
        "skills_gap_count": gap,
        "roadmap_completion_percentage": completion_pct,
        "upcoming_tasks": upcoming
    }
