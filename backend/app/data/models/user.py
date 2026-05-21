from sqlalchemy import String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List, TYPE_CHECKING
from app.data.models.base import BaseModel

if TYPE_CHECKING:
    from app.data.models.shop import Shop

class User(BaseModel):
    """
    SQLAlchemy model representing system Users (Owners and Staff).
    """
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(
        String(50), 
        unique=True, 
        index=True, 
        nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20), 
        nullable=False
    )  # 'owner', 'staff'
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True
    )

    # Scoped shop association (Staff belongs to 1 shop; Owner is nullable upon signup)
    shop_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("shops.id", ondelete="SET NULL"), 
        nullable=True
    )

    # Relationships
    # User's active working shop (Staff)
    shop: Mapped[Optional["Shop"]] = relationship(
        "Shop", 
        foreign_keys=[shop_id], 
        back_populates="staff_members"
    )
    
    # Shops owned by this user (Only applicable for Owners)
    owned_shops: Mapped[List["Shop"]] = relationship(
        "Shop", 
        back_populates="owner", 
        foreign_keys="[Shop.owner_id]"
    )
