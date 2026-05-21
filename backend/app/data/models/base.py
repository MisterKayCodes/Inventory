from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import func
from app.data.database import Base

class BaseModel(Base):
    """
    Abstract Base Model providing standard columns for all tables.
    Uses modern SQLAlchemy 2.0 type mapping.
    """
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    
    created_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        server_default=func.now()
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now()
    )
