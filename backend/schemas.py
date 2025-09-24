from pydantic import BaseModel, EmailStr
from typing import Optional

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
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str