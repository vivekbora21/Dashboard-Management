from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)     
    price = Column(Float, default=0.0)                             
    description = Column(Text, nullable=True)
    features = Column(Text, nullable=True)                       
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="plan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firstName = Column(String(100), index=True)
    lastName = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20))
    hashed_password = Column(String(255))
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, default=1) 
    plan_expiry = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    plan = relationship("Plan", back_populates="users")
    products = relationship("Product", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    productName = Column(String(255), index=True)
    productCategory = Column(String(100))
    productPrice = Column(Float)
    sellingPrice = Column(Float)
    quantity = Column(Integer)
    userId = Column(Integer, ForeignKey("users.id"))
    ratings = Column(Float, nullable=True)
    discounts = Column(String(50), nullable=True)
    soldDate = Column(Date, nullable=True)

    user = relationship("User", back_populates="products")

class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")           
    payment_id = Column(String(255), nullable=True)                 
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
    plan = relationship("Plan")
