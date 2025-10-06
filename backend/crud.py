from sqlalchemy.orm import Session
import models
import schemas
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from utils import parse_date

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
    # Normalize soldDate before saving
    normalized_date = None
    if product.soldDate:
        try:
            # product.soldDate can be date or str, convert to str for parsing
            normalized_date = parse_date(str(product.soldDate))
        except ValueError as e:
            raise Exception(f"Invalid date format for soldDate: {e}")

    db_product = models.Product(
        productName=product.productName,
        productCategory=product.productCategory,
        productPrice=product.productPrice,
        sellingPrice=product.sellingPrice,
        quantity=product.quantity,
        userId=product.userId,
        ratings=product.ratings,
        discounts=product.discounts,
        soldDate=normalized_date
    )
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except IntegrityError:
        db.rollback()
        raise Exception("Error creating product!")

def get_products(db: Session, user_id: int):
    return db.query(models.Product).filter(models.Product.userId == user_id).all()

def update_product(db: Session, product_id: int, product: schemas.ProductCreate, user_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id, models.Product.userId == user_id).first()
    if not db_product:
        return None
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int, user_id: int):
    db_product = db.query(models.Product).filter(models.Product.id == product_id, models.Product.userId == user_id).first()
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
    from sqlalchemy import func, extract

    today = datetime.now().date()

    # If period is in 'YYYY-MM' format, filter by that month
    try:
        if len(period) == 7 and period[4] == '-':
            year = int(period[:4])
            month = int(period[5:7])
            results = db.query(
                models.Product.soldDate,
                func.sum(models.Product.sellingPrice).label('sales'),
                func.sum(models.Product.sellingPrice - models.Product.productPrice).label('profit')
            ).filter(
                extract('year', models.Product.soldDate) == year,
                extract('month', models.Product.soldDate) == month,
                models.Product.userId == user_id
            ).group_by(models.Product.soldDate).all()

            return [{'date': str(r.soldDate), 'sales': float(r.sales), 'profit': float(r.profit)} for r in results]
    except Exception:
        pass

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
