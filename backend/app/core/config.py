"""
Core Application Settings
Marketing Strategy Assessment System
Standardized on PostgreSQL (Prisma Postgres), Pinecone, OpenAI, and Better Auth
"""
import os
from typing import List, Optional, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    # App Information
    PROJECT_NAME: str = "Marketing Strategy Assessment System"
    VERSION: str = "1.1.0"
    ENVIRONMENT: str = Field(default="development") # development, evaluation, production
    DEBUG: bool = Field(default=True)
    LOG_LEVEL: str = Field(default="INFO")
    
    # Server Binding
    BACKEND_HOST: str = Field(default="0.0.0.0")
    BACKEND_PORT: int = Field(default=8000)
    API_V1_PREFIX: str = Field(default="/api/v1")
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v
    
    # -------------------------------------------------------------------------
    # Relational Database (Prisma Postgres / PostgreSQL) - Server-Side ONLY
    # -------------------------------------------------------------------------
    DATABASE_URL: Optional[str] = Field(default=None)
    DIRECT_URL: Optional[str] = Field(default=None)
    DB_POOL_SIZE: int = Field(default=10)
    DB_MAX_OVERFLOW: int = Field(default=20)
    DB_POOL_TIMEOUT: int = Field(default=30)
    
    # -------------------------------------------------------------------------
    # Generative AI & Embeddings (OpenAI API) - Server-Side ONLY
    # -------------------------------------------------------------------------
    OPENAI_API_KEY: Optional[str] = Field(default=None)
    OPENAI_EMBEDDING_MODEL: str = Field(default="text-embedding-3-large")
    OPENAI_GENERATION_MODEL: str = Field(default="gpt-4o-mini")
    OPENAI_MAX_RETRIES: int = Field(default=3)
    OPENAI_TIMEOUT_SECONDS: float = Field(default=30.0)
    OPENAI_TEMPERATURE: float = Field(default=0.3)
    
    # -------------------------------------------------------------------------
    # Vector Database (Pinecone Vector DB) - Server-Side ONLY
    # -------------------------------------------------------------------------
    PINECONE_API_KEY: Optional[str] = Field(default=None)
    PINECONE_INDEX_HOST: Optional[str] = Field(default=None)
    PINECONE_INDEX_NAME: Optional[str] = Field(default="smart-tech-consulting-platform")
    PINECONE_NAMESPACE_PREFIX: str = Field(default="staging-marketing")
    PINECONE_EMBEDDING_DIMENSION: int = Field(default=3072)
    RAG_ENABLED: bool = Field(default=True)
    RAG_TOP_K: int = Field(default=4)
    RAG_MIN_SCORE: float = Field(default=0.35)
    
    # -------------------------------------------------------------------------
    # Authentication & Identity (Better Auth) - Server-Side ONLY
    # -------------------------------------------------------------------------
    BETTER_AUTH_URL: Optional[str] = Field(default="http://localhost:3000")
    BETTER_AUTH_SECRET: Optional[str] = Field(default=None)
    
    # -------------------------------------------------------------------------
    # Document Storage (Optional Vercel Blob) - Server-Side ONLY
    # -------------------------------------------------------------------------
    BLOB_READ_WRITE_TOKEN: Optional[str] = Field(default=None)

    # -------------------------------------------------------------------------
    # Machine Learning & Decision Engine
    # -------------------------------------------------------------------------
    MODEL_ARTIFACT_DIR: str = Field(default="ml/artifacts")
    ML_DEVICE: str = Field(default="cpu")
    RANDOM_SEED: int = Field(default=20261020)
    DEFAULT_CLASSIFIER: str = Field(default="fusion")
    
    # Data Paths
    DATASET_PATH: str = Field(default="Dataset/Marketing_Questionnaire_Synthetic_5000.csv")
    ML_DATASET_PATH: str = Field(default="Dataset/Audience_Classifier_ML_5000.csv")
    BUDGET_DATASET_PATH: str = Field(default="Dataset/Marketing_Channel_Budget_5000.csv")

    # -------------------------------------------------------------------------
    # Backward Compatibility (Supabase & Gemini Fallbacks)
    # -------------------------------------------------------------------------
    SUPABASE_URL: Optional[str] = Field(default=None)
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(default=None)
    SUPABASE_JWT_SECRET: Optional[str] = Field(default=None)
    
    GEMINI_API_KEY: Optional[str] = Field(default=None)
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")
    GEMINI_TEMPERATURE: float = Field(default=0.3)
    GEMINI_MAX_RETRIES: int = Field(default=3)

    @field_validator("MODEL_ARTIFACT_DIR", "DATASET_PATH", "ML_DATASET_PATH", "BUDGET_DATASET_PATH", mode="after")
    def resolve_relative_paths(cls, v: str) -> str:
        if os.path.isabs(v):
            return v
        if os.path.exists(v):
            return v
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        candidate = os.path.join(project_root, v)
        if os.path.exists(candidate):
            return candidate
        return v

    model_config = SettingsConfigDict(
        env_file=(
            ".env",
            "../.env",
            os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")), ".env")
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
