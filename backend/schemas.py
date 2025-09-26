from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    password: str
    confirmPassword: Optional[str] = None

class UserOut(BaseModel):
    id: int
    firstName: str
    lastName: str
    email: EmailStr
    phone: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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

    class Config:
        from_attributes = True
