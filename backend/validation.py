from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models
import auth

def validate_signup(db: Session, user):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

def validate_login(db: Session, user):
    db_user = db.query(models.User).filter(models.User.email == user.email.lower()).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password")

    return db_user

def validate_update_user(db: Session, user_id: int, user):
    current_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not current_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.email != current_user.email:
        existing_user = db.query(models.User).filter(models.User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

def validate_add_product(product):
    if product.productPrice <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product price must be greater than 0")
    if product.sellingPrice < product.productPrice:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selling price must be greater than or equal to product price")
    if product.quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be greater than 0")
    if product.ratings is not None and (product.ratings < 0 or product.ratings > 5):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ratings must be between 0 and 5")
