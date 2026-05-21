from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class ShopBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name of the retail store")
    location: Optional[str] = Field(None, max_length=255, description="Physical location or city")

class ShopCreate(ShopBase):
    pass

class ShopResponse(ShopBase):
    id: int
    owner_id: int
    created_at: datetime

    # Modern Pydantic v2 configuration to read data from SQLAlchemy ORM models
    model_config = ConfigDict(from_attributes=True)
