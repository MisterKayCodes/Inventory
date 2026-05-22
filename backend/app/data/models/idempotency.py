from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime
from app.data.models.base import Base

class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    key = Column(String, primary_key=True, index=True)
    used_at = Column(DateTime, default=datetime.utcnow, nullable=False)
