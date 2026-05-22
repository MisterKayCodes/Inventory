from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from .base import Base

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    serial_number = Column(String, nullable=False)
    verified_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)


    shop = relationship("Shop", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")
