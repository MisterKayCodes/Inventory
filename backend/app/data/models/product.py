from datetime import datetime
from sqlalchemy import Enum, String, Float, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.data.database import Base
from app.data.models.base import BaseModel
import enum
from typing import Optional, List

class ProductStatus(str, enum.Enum):
    IN_STOCK = "in_stock"
    RESERVED = "reserved"
    SOLD = "sold"
    DAMAGED = "damaged"

class Product(BaseModel):
    __tablename__ = "products"

    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    brand_model: Mapped[str] = mapped_column(String(255), nullable=False)
    serial_number: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[ProductStatus] = mapped_column(Enum(ProductStatus), nullable=False, default=ProductStatus.IN_STOCK)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Category relationship
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    
    # Transactions referencing this product
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="product",
        cascade="all, delete-orphan"
    )

