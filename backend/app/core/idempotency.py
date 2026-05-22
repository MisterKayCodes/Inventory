from sqlalchemy.orm import Session
from app.data.models.idempotency import IdempotencyKey
from datetime import datetime


def check_idempotency_key(db: Session, key: str) -> bool:
    """Check if an idempotency key has already been used.

    Returns True if the key is new (and marks it as used), False if already used.
    """
    existing = db.query(IdempotencyKey).filter(IdempotencyKey.key == key).first()
    if existing:
        return False
    # Insert new key
    new_key = IdempotencyKey(key=key, used_at=datetime.utcnow())
    db.add(new_key)
    db.commit()
    return True
