from typing import Optional

from sqlalchemy.orm import Session

from app.data.models.product import Product
from app.data.models.shop import Shop


def normalize_serial(serial: str) -> str:
    """Normalize a serial number for comparison.

    - Lowercase
    - Strip surrounding whitespace
    - Remove hyphens and spaces
    """
    return serial.strip().replace("-", "").replace(" ", "").lower()


def match_serial(db: Session, shop_id: int, serial: str) -> Optional[Product]:
    """Return the Product matching the given serial number within the shop.
    Performs normalization in Python for SQLite compatibility.
    """
    normalized = normalize_serial(serial)
    # Query products for the shop where serial_number is not null
    candidates = (
        db.query(Product)
        .join(Shop)
        .filter(Shop.id == shop_id)
        .filter(Product.serial_number.isnot(None))
        .all()
    )
    for prod in candidates:
        if normalize_serial(prod.serial_number or "") == normalized:
            return prod
    return None
