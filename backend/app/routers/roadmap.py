import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, RoadmapTask, Skill
from ..schemas import RoadmapTaskResponse, RoadmapTaskUpdateStatus
from ..auth import get_current_user
from ..services.ai_service import ai_service

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

@router.get("", response_model=List[RoadmapTaskResponse])
def get_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(RoadmapTask).filter(RoadmapTask.user_id == current_user.id).order_by(RoadmapTask.week_number.asc()).all()
    return tasks

@router.post("/generate", response_model=List[RoadmapTaskResponse])
def generate_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please specify a target role in your profile before generating a roadmap."
        )

    # 1. Fetch missing skills
    missing_skills = db.query(Skill).filter(Skill.user_id == current_user.id, Skill.status == "gap").all()
    missing_skill_names = [s.name for s in missing_skills]
    
    # 2. Call AI service to generate weeks/milestones
    weekly_tasks = ai_service.generate_roadmap(
        target_role=current_user.target_role,
        missing_skills=missing_skill_names,
        study_hours=current_user.study_hours_per_week,
        timeline_months=current_user.timeline_months
    )
    
    # 3. Wipe old roadmap
    db.query(RoadmapTask).filter(RoadmapTask.user_id == current_user.id).delete()
    
    # 4. Insert new roadmap tasks
    created_tasks = []
    for t in weekly_tasks:
        db_task = RoadmapTask(
            user_id=current_user.id,
            week_number=t.get("week_number"),
            month_number=t.get("month_number"),
            title=t.get("title"),
            description=t.get("description"),
            status="pending",
            resources=json.dumps(t.get("resources", [])),
            category=t.get("category", "General")
        )
        db.add(db_task)
        created_tasks.append(db_task)
        
    db.commit()
    
    # Refresh to retrieve ids
    for task in created_tasks:
        db.refresh(task)
        
    return created_tasks

@router.put("/tasks/{task_id}", response_model=RoadmapTaskResponse)
def update_task_status(task_id: int, status_update: RoadmapTaskUpdateStatus, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(RoadmapTask).filter(RoadmapTask.id == task_id, RoadmapTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap task not found."
        )
        
    task.status = status_update.status
    db.commit()
    db.refresh(task)
    return task
