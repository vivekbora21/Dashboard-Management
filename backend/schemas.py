from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict
from typing import Optional
from datetime import date
import re

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    password: str
    confirmPassword: Optional[str] = None

    @field_validator('firstName')
    @classmethod
    def validate_first_name(cls, v):
        v = v.strip()
        if len(v) < 3 or len(v) > 20:
            raise ValueError('First name must be at least 3 characters and at most 20 characters')
        if not re.match(r'^[a-zA-Z]+$', v):
            raise ValueError('First name can only contain letters')
        return v

    @field_validator('lastName')
    @classmethod
    def validate_last_name(cls, v):
        v = v.strip()
        if len(v) < 3 or len(v) > 20:
            raise ValueError('Last name must be at least 3 characters and at most 20 characters')
        if not re.match(r'^[a-zA-Z]+$', v):
            raise ValueError('Last name can only contain letters')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not re.match(r'^\+?[\d\s()-]{10,}$', v):
            raise ValueError('Please enter a valid phone number')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.match(r'(?=.*[a-z])(?=.*[A-Z])(?=.*\d)', v):
            raise ValueError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
        return v

    @model_validator(mode='after')
    def validate_confirm_password(self):
        if self.confirmPassword != self.password:
            raise ValueError('Passwords do not match')
        return self

class UserOut(BaseModel):
    id: int
    firstName: str
    lastName: str
    email: EmailStr
    phone: str

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str

    @field_validator('firstName')
    @classmethod
    def validate_first_name(cls, v):
        v = v.strip()
        if len(v) < 3 or len(v) > 20:
            raise ValueError('First name must be at least 3 characters and at most 20 characters')
        if not re.match(r'^[a-zA-Z]+$', v):
            raise ValueError('First name can only contain letters')
        return v

    @field_validator('lastName')
    @classmethod
    def validate_last_name(cls, v):
        v = v.strip()
        if len(v) < 3 or len(v) > 20:
            raise ValueError('Last name must be at least 3 characters and at most 20 characters')
        if not re.match(r'^[a-zA-Z]+$', v):
            raise ValueError('Last name can only contain letters')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not re.match(r'^\+?[\d\s-()]{10,}$', v):
            raise ValueError('Please enter a valid phone number')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v:
            raise ValueError('Password is required')
        return v

class ProductCreate(BaseModel):
    productName: str
    productCategory: str
    productPrice: float
    sellingPrice: float
    quantity: int
    userId: int
    ratings: Optional[float] = None
    discounts: Optional[str] = None
    soldDate: Optional[date] = None

    @field_validator('productName')
    @classmethod
    def validate_product_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Product name is required')
        return v

    @field_validator('productCategory')
    @classmethod
    def validate_product_category(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Product category is required')
        return v

    @field_validator('productPrice')
    @classmethod
    def validate_product_price(cls, v):
        if v <= 0:
            raise ValueError('Product price must be greater than 0')
        return v

    @field_validator('sellingPrice')
    @classmethod
    def validate_selling_price(cls, v):
        if v <= 0:
            raise ValueError('Selling price must be greater than 0')
        return v

    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

    @field_validator('ratings')
    @classmethod
    def validate_ratings(cls, v):
        if v is not None and (v < 0 or v > 5):
            raise ValueError('Ratings must be between 0 and 5')
        return v

class ProductOut(BaseModel):
    id: int
    productName: str
    productCategory: str
    productPrice: float
    sellingPrice: float
    quantity: int
    userId: int
    ratings: Optional[float] = None
    discounts: Optional[str] = None
    soldDate: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)
