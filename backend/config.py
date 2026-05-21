import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Inventory & Verification System"
    DEBUG: bool = True
    
    # Security Settings
    # IMPORTANT: In production, override this with a secure secret key
    SECRET_KEY: str = "supersecret_key_change_in_production_99228833118822"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database Settings
    # Defaults to a local SQLite database file in the backend root
    DATABASE_URL: str = "sqlite:///./inventory.db"
    
    # Upload Settings
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

    # Load from .env file if it exists
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
