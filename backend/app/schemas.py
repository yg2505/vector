from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    target_role: Optional[str] = None
    career_goal: Optional[str] = None
    timeline_months: Optional[int] = None
    study_hours_per_week: Optional[int] = None
    readiness_score: Optional[int] = None
    learning_streak: Optional[int] = None

class UserResponse(UserBase):
    id: int
    target_role: Optional[str] = None
    career_goal: Optional[str] = None
    timeline_months: int
    study_hours_per_week: int
    readiness_score: int
    learning_streak: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Skill Schemas
class SkillBase(BaseModel):
    name: str
    status: str  # "mastered", "learning", "gap"
    category: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    status: str

class SkillResponse(SkillBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Roadmap Task Schemas
class RoadmapTaskBase(BaseModel):
    week_number: int
    month_number: int
    title: str
    description: Optional[str] = None
    status: str  # "pending", "in_progress", "completed"
    resources: Optional[str] = None  # JSON string
    category: Optional[str] = None

class RoadmapTaskUpdateStatus(BaseModel):
    status: str

class RoadmapTaskResponse(RoadmapTaskBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Resume Schemas
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    ats_score: int
    feedback_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Chat Message Schemas
class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Summary
class DashboardSummary(BaseModel):
    full_name: Optional[str]
    target_role: Optional[str]
    career_goal: Optional[str]
    readiness_score: int
    learning_streak: int
    skills_mastered_count: int
    skills_learning_count: int
    skills_gap_count: int
    roadmap_completion_percentage: float
    upcoming_tasks: List[RoadmapTaskResponse]
