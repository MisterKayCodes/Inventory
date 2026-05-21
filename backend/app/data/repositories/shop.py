from sqlalchemy.orm import Session
from typing import List
from app.data.models.shop import Shop
from app.data.repositories.base import BaseRepository

class ShopRepository(BaseRepository[Shop]):
    """
    Shop-specific Repository handling specialized query operations for shops.
    """
    def __init__(self):
        super().__init__(Shop)

    def get_by_owner(self, db: Session, *, owner_id: int) -> List[Shop]:
        """Fetch all shops registered under a specific owner's user ID."""
        return db.query(self.model).filter(self.model.owner_id == owner_id).all()

shop_repo = ShopRepository()
