"""
Core Application Settings
Marketing Strategy Assessment System
"""
import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Marketing Strategy Assessment System"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development") # development, evaluation, production
    DEBUG: bool = Field(default=True)
    LOG_LEVEL: str = Field(default="INFO")
    
    # Server
    BACKEND_HOST: str = Field(default="0.0.0.0")
    BACKEND_PORT: int = Field(default=8000)
    API_V1_PREFIX: str = Field(default="/api/v1")
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # Supabase Persistence & Auth
    SUPABASE_URL: Optional[str] = Field(default=None)
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(default=None)
    SUPABASE_JWT_SECRET: Optional[str] = Field(default=None)
    
    # Gemini LLM Inference Service (Server-side ONLY)
    GEMINI_API_KEY: Optional[str] = Field(default=None)
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")
    GEMINI_TEMPERATURE: float = Field(default=0.3)
    GEMINI_MAX_RETRIES: int = Field(default=3)
    
    # ML & Decision Engine
    MODEL_ARTIFACT_DIR: str = Field(default="ml/artifacts")
    ML_DEVICE: str = Field(default="cpu")
    RANDOM_SEED: int = Field(default=20261020)
    
    # Data Paths
    DATASET_PATH: str = Field(default="Dataset/Marketing_Questionnaire_Synthetic_5000.csv")
    ML_DATASET_PATH: str = Field(default="Dataset/Audience_Classifier_ML_5000.csv")
    BUDGET_DATASET_PATH: str = Field(default="Dataset/Marketing_Channel_Budget_5000.csv")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
