from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, ChatMessage, Skill, RoadmapTask
from ..schemas import ChatMessageResponse, ChatMessageCreate
from ..auth import get_current_user
from ..services.ai_service import ai_service
from ..services.vector_service import vector_service

router = APIRouter(prefix="/coach", tags=["coach"])

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.post("/chat", response_model=ChatMessageResponse)
def post_chat_message(
    message_data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Save user message to SQL DB
        user_msg = ChatMessage(
            user_id=current_user.id,
            role="user",
            content=message_data.content
        )
        db.add(user_msg)
        db.commit()
        
        # 2. Get RAG context from Vector Database (ChromaDB)
        vector_context = vector_service.query_similar(
            query_text=message_data.content,
            user_id=current_user.id,
            limit=3
        )
        
        # 3. Gather SQL user profile context
        missing_skills = db.query(Skill).filter(Skill.user_id == current_user.id, Skill.status == "gap").all()
        missing_names = [s.name for s in missing_skills]
        
        upcoming_tasks = db.query(RoadmapTask).filter(
            RoadmapTask.user_id == current_user.id,
            RoadmapTask.status != "completed"
        ).order_by(RoadmapTask.week_number.asc()).all()
        
        # Retrieve recent conversation logs
        past_msgs = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.desc()).limit(10).all()
        # Sort back to chronological order
        chat_history = [{"role": msg.role, "content": msg.content} for msg in reversed(past_msgs)]
        
        # 4. Invoke AI Career Coach
        coach_text = ai_service.chat_coach(
            message=message_data.content,
            user_role=current_user.target_role or "Software Engineer",
            user_goal=current_user.career_goal or "Land a tech job",
            missing_skills=missing_names,
            upcoming_tasks=upcoming_tasks,
            vector_context=vector_context,
            chat_history=chat_history
        )
        
        # 5. Save coach response to SQL DB
        coach_msg = ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=coach_text
        )
        db.add(coach_msg)
        db.commit()
        db.refresh(coach_msg)
        
        return coach_msg
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Career Coach error: {str(e)}"
        )
