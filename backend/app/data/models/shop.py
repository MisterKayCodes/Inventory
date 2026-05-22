from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING
from app.data.models.base import BaseModel

if TYPE_CHECKING:
    from app.data.models.user import User
    from app.data.models.product import Product

class Shop(BaseModel):
    """
    SQLAlchemy model representing a retail Shop.
    """
    __tablename__ = "shops"

    name: Mapped[str] = mapped_column(
        String(100), 
        nullable=False
    )
    location: Mapped[str] = mapped_column(
        String(255), 
        nullable=True
    )
    
    # The Owner who registered this shop
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )

    # Relationships
    owner: Mapped["User"] = relationship(
        "User", 
        foreign_keys=[owner_id], 
        back_populates="owned_shops"
    )
    
    staff_members: Mapped[List["User"]] = relationship(
        "User", 
        foreign_keys="[User.shop_id]", 
        back_populates="shop"
    )

    # Products belonging to this shop
    # Transactions belonging to this shop
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="shop",
        cascade="all, delete-orphan"
    )

