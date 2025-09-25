from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

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
    userId = Column(String(100))
    ratings = Column(Float, nullable=True)
    discounts = Column(String(50), nullable=True)
