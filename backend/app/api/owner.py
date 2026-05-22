from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.data.database import get_db
from app.data.models.transaction import Transaction, TransactionStatus
from app.data.models.product import Product
from app.data.models.shop import Shop
from app.schemas.owner import DashboardMetrics, TransactionRead
from app.dependencies import require_owner
from app.data.models.user import User

router = APIRouter(tags=["owner"])

@router.get("/dashboard/overview", response_model=DashboardMetrics)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    owner_shop_ids = [shop.id for shop in current_user.owned_shops]
    if not owner_shop_ids:
        return DashboardMetrics(total_sales_count=0, total_revenue=0.0, total_errors=0)

    # Get completed transactions
    completed_txs = db.query(Transaction, Product).join(
        Product, Transaction.product_id == Product.id
    ).filter(
        Transaction.shop_id.in_(owner_shop_ids),
        Transaction.status == TransactionStatus.COMPLETED
    ).all()

    total_sales_count = len(completed_txs)
    total_revenue = sum([prod.price for tx, prod in completed_txs])

    # Get failed transactions
    total_errors = db.query(Transaction).filter(
        Transaction.shop_id.in_(owner_shop_ids),
        Transaction.status == TransactionStatus.FAILED
    ).count()

    return DashboardMetrics(
        total_sales_count=total_sales_count,
        total_revenue=float(total_revenue),
        total_errors=total_errors
    )

@router.get("/transactions", response_model=List[TransactionRead])
def list_transactions(
    shop_id: int,
    status: Optional[TransactionStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    shop = db.query(Shop).filter(Shop.id == shop_id, Shop.owner_id == current_user.id).first()
    if not shop:
        raise HTTPException(status_code=403, detail="Not authorized to view transactions for this shop")

    query = db.query(Transaction).filter(Transaction.shop_id == shop_id)

    if status:
        query = query.filter(Transaction.status == status)
    
    if start_date:
        query = query.filter(Transaction.verified_at >= start_date)
    
    if end_date:
        query = query.filter(Transaction.verified_at <= end_date)

    transactions = query.order_by(Transaction.verified_at.desc()).offset(skip).limit(limit).all()
    return transactions
