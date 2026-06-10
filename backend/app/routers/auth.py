from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, UserUpdate, Token
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Create new user
    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name,
        target_role="",
        career_goal="",
        timeline_months=6,
        study_hours_per_week=10,
        readiness_score=0,
        learning_streak=1
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(profile_updates: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update properties
    if profile_updates.target_role is not None:
        current_user.target_role = profile_updates.target_role
    if profile_updates.career_goal is not None:
        current_user.career_goal = profile_updates.career_goal
    if profile_updates.timeline_months is not None:
        current_user.timeline_months = profile_updates.timeline_months
    if profile_updates.study_hours_per_week is not None:
        current_user.study_hours_per_week = profile_updates.study_hours_per_week
    if profile_updates.readiness_score is not None:
        current_user.readiness_score = profile_updates.readiness_score
    if profile_updates.learning_streak is not None:
        current_user.learning_streak = profile_updates.learning_streak

    db.commit()
    db.refresh(current_user)
    return current_user
