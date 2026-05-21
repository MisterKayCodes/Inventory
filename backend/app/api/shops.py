from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.data.database import get_db
from app.data.repositories.shop import shop_repo
from app.data.repositories.user import user_repo
from app.data.schemas.shop import ShopCreate, ShopResponse
from app.data.models.user import User
from app.dependencies import get_current_user, require_owner

router = APIRouter(prefix="/shops", tags=["Shops"])

@router.post("", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
def create_shop(
    shop_in: ShopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    """
    Register a new Shop under the current business owner.
    Restricted strictly to users with the 'owner' role.
    """
    shop_dict = {
        "name": shop_in.name,
        "location": shop_in.location,
        "owner_id": current_user.id
    }
    new_shop = shop_repo.create(db, obj_in=shop_dict)
    
    # Automatically associate this as the owner's primary working shop 
    # if they do not have one assigned yet.
    if current_user.shop_id is None:
        user_repo.update(db, db_obj=current_user, obj_in={"shop_id": new_shop.id})
        
    return new_shop

@router.get("", response_model=List[ShopResponse])
def list_shops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List shops accessible by the authenticated user.
    - Business Owners: returns all shops registered under their ownership.
    - Staff members: returns a list containing only the single shop they work in.
    """
    if current_user.role == "owner":
        return shop_repo.get_by_owner(db, owner_id=current_user.id)
    
    # Staff: only returns their specific assigned shop (if assigned)
    if current_user.shop_id:
        shop = shop_repo.get(db, id=current_user.shop_id)
        return [shop] if shop else []
        
    return []
