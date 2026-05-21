from pydantic import BaseModel, Field
from typing import Optional

class CategoryBase(BaseModel):
    name: str = Field(..., description="Category name, e.g., 'Air Conditioner'")

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    class Config:
        orm_mode = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
