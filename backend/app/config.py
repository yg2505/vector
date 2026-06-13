import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environmental variables from .env file
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vector — AI Career Copilot"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_for_career_copilot_jwt_token_auth_98231")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_ILpwtzX47fyB@ep-ancient-lab-ao3o05rg.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require")
    
    # AI Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # Chroma Vector Database Settings
    CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "./chroma_db")

    class Config:
        case_sensitive = True

settings = Settings()
