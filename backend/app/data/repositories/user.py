from sqlalchemy.orm import Session
from typing import Optional
from app.data.models.user import User
from app.data.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    """
    User-specific Repository handling specialized query operations for users.
    """
    def __init__(self):
        super().__init__(User)

    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        """Fetch a user record by their unique username."""
        return db.query(self.model).filter(self.model.username == username).first()

user_repo = UserRepository()
