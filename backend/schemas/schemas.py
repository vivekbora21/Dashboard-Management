from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict
from typing import Optional
from datetime import date,datetime      
import re

def validate_name(value: str, field_name: str) -> str:
    value = value.strip()
    if len(value) < 3 or len(value) > 20:
        raise ValueError(f'{field_name} must be between 3 and 20 characters')
    if not re.match(r'^[a-zA-Z]+$', value):
        raise ValueError(f'{field_name} can only contain letters')
    return value


def validate_phone_number(value: str) -> str:
    if not re.match(r'^\+?[\d\s()-]{10,}$', value):
        raise ValueError('Please enter a valid phone number')
    return value


def validate_password_strength(value: str) -> str:
    if len(value) < 8:
        raise ValueError('Password must be at least 8 characters')
    if not re.match(r'(?=.*[a-z])(?=.*[A-Z])(?=.*\d)', value):
        raise ValueError('Password must contain uppercase, lowercase, and at least one number')
    return value

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    password: str
    confirmPassword: Optional[str] = None

    @field_validator('firstName')
    def validate_first_name(cls, v): return validate_name(v, "First name")

    @field_validator('lastName')
    def validate_last_name(cls, v): return validate_name(v, "Last name")

    @field_validator('phone')
    def validate_phone(cls, v): return validate_phone_number(v)

    @field_validator('password')
    def validate_password(cls, v): return validate_password_strength(v)

    @model_validator(mode='after')
    def check_passwords_match(self):
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
    def validate_first_name(cls, v): return validate_name(v, "First name")

    @field_validator('lastName')
    def validate_last_name(cls, v): return validate_name(v, "Last name")

    @field_validator('phone')
    def validate_phone(cls, v): return validate_phone_number(v)


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    def password_not_empty(cls, v):
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

    @field_validator('productName', 'productCategory')
    def validate_text_fields(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('This field is required')
        return v

    @field_validator('productPrice', 'sellingPrice')
    def validate_positive_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    @field_validator('quantity')
    def validate_positive_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

    @field_validator('ratings')
    def validate_rating_range(cls, v):
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

class PlanOut(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str] = None
    features: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserPlanOut(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str] = None
    features: Optional[str] = None
    expiry: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
