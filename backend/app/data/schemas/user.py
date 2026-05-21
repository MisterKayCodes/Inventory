from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    role: str = Field(..., description="Role must be either 'owner' or 'staff'")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    shop_id: Optional[int] = Field(None, description="Shop ID (required for staff, nullable for owners during onboarding)")

class UserLogin(BaseModel):
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")

class UserResponse(UserBase):
    id: int
    is_active: bool
    shop_id: Optional[int] = None
    created_at: datetime

    # Modern Pydantic v2 configuration to read data from SQLAlchemy ORM models
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
