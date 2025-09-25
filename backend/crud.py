from sqlalchemy.orm import Session
import models
import schemas
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

# Initialize password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email,
        phone=user.phone,
        hashed_password=hash_password(user.password)
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise Exception("User already exists!")

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        productName=product.productName,
        productCategory=product.productCategory,
        productPrice=product.productPrice,
        sellingPrice=product.sellingPrice,
        quantity=product.quantity,
        userId=product.userId,
        ratings=product.ratings,
        discounts=product.discounts
    )
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise Exception("Error creating product!")

def get_products(db: Session):
    return db.query(models.Product).all()
