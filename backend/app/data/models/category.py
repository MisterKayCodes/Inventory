from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.data.models.base import BaseModel

class Category(BaseModel):
    __tablename__ = "categories"

    # Each category belongs to a shop (multi‑tenant)
    shop_id: Mapped[int] = mapped_column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Ensure a shop cannot have two categories with the same name
    __table_args__ = (UniqueConstraint("shop_id", "name", name="uq_category_shop_name"),)

    # Relationship back‑to‑products (optional, lazy loading)
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")
