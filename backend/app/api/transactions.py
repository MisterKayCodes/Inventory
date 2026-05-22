from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_owner_or_staff
from app.core.verification import match_serial
from app.core.idempotency import check_idempotency_key
from app.data.models.transaction import Transaction
from app.data.models.product import Product
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/transactions", tags=["transactions"])

class VerifyRequest(BaseModel):
    shop_id: int
    serial: str

class VerifyResponse(BaseModel):
    matched: bool
    product_id: Optional[int] = None

@router.post("/verify", response_model=VerifyResponse)
def verify_serial(request: VerifyRequest, db: Session = Depends(get_db), _: None = Depends(require_owner_or_staff)):
    product = match_serial(db, request.shop_id, request.serial)
    if product:
        return VerifyResponse(matched=True, product_id=product.id)
    return VerifyResponse(matched=False)

class ConfirmRequest(BaseModel):
    shop_id: int
    product_id: int
    idempotency_key: str
    serial: str

@router.post("/confirm-sale")
def confirm_sale(req: ConfirmRequest, db: Session = Depends(get_db), _: None = Depends(require_owner_or_staff)):
    # Ensure idempotency
    if not check_idempotency_key(db, req.idempotency_key):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate transaction")
    # Create transaction record
    txn = Transaction(
        shop_id=req.shop_id,
        product_id=req.product_id,
        serial_number=req.serial,
        status="completed",
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return {"transaction_id": txn.id, "status": txn.status}
