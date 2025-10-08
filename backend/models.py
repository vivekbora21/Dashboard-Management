from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from database import Base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    firstName = Column(String(100), index=True)
    lastName = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20))
    hashed_password = Column(String(255))

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, index=True)
    productName = Column(String(255), index=True)
    productCategory = Column(String(100))
    productPrice = Column(Float)
    sellingPrice = Column(Float)
    quantity = Column(Integer)
    userId = Column(Integer, ForeignKey('users.id'))
    ratings = Column(Float, nullable=True)
    discounts = Column(String(50), nullable=True)
    soldDate = Column(Date, nullable=True)


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)