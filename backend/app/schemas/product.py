from pydantic import BaseModel, Field, HttpUrl, validator, ConfigDict
from typing import Optional
from enum import Enum
from decimal import Decimal

class ProductStatus(str, Enum):
    in_stock = "in_stock"
    reserved = "reserved"
    sold = "sold"
    damaged = "damaged"

class ProductBase(BaseModel):
    brand_model: str = Field(..., description="Brand and model, e.g., 'LG 55-inch OLED'")
    serial_number: Optional[str] = Field(None, description="Unique serial number / barcode on the box")
    price: float = Field(..., gt=0, description="Price in NGN")
    status: ProductStatus = Field(default=ProductStatus.in_stock, description="Current status of the product")
    photo_url: Optional[HttpUrl] = Field(None, description="URL of the product image stored on Cloudinary")
    category_id: int = Field(..., description="Foreign key to Category")
    model_config = ConfigDict(from_attributes=True, json_encoders={Decimal: float})

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int
    shop_id: int
    # Config already handled via model_config above

class ProductUpdate(BaseModel):
    brand_model: Optional[str] = None
    serial_number: Optional[str] = None
    price: Optional[float] = None
    status: Optional[ProductStatus] = None
    photo_url: Optional[HttpUrl] = None
    category_id: Optional[int] = None
    
    @validator("status", pre=True, always=True)
    def validate_status(cls, v):
        return v
