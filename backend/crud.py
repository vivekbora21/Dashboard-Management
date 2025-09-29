from sqlalchemy.orm import Session
import models
import schemas
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

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
        discounts=product.discounts,
        soldDate=product.soldDate
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

def update_product(db: Session, product_id: int, product: schemas.ProductCreate):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        return None
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        return None
    db.delete(db_product)
    db.commit()
    return True

def get_products_by_date(db: Session, date: str, user_id: int):
    from datetime import datetime
    try:
        query_date = datetime.strptime(date, '%Y-%m-%d').date()
        return db.query(models.Product).filter(models.Product.soldDate == query_date, models.Product.userId == user_id).all()
    except ValueError:
        return []

def get_summary(db: Session, period: str, user_id: int):
    from datetime import datetime, timedelta
    from sqlalchemy import func

    today = datetime.now().date()
    if period == 'week':
        start_date = today - timedelta(days=7)
    elif period == 'month':
        start_date = today - timedelta(days=30)
    else:
        return []

    results = db.query(
        models.Product.soldDate,
        func.sum(models.Product.sellingPrice).label('sales'),
        func.sum(models.Product.sellingPrice - models.Product.productPrice).label('profit')
    ).filter(
        models.Product.soldDate >= start_date,
        models.Product.soldDate <= today,
        models.Product.userId == user_id
    ).group_by(models.Product.soldDate).all()

    return [{'date': str(r.soldDate), 'sales': float(r.sales), 'profit': float(r.profit)} for r in results]
