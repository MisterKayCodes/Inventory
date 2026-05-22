from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.data.models.transaction import TransactionStatus

class DashboardMetrics(BaseModel):
    total_sales_count: int
    total_revenue: float
    total_errors: int

class TransactionRead(BaseModel):
    id: int
    shop_id: int
    product_id: int
    serial_number: str
    verified_at: datetime
    status: TransactionStatus

    model_config = ConfigDict(from_attributes=True)
