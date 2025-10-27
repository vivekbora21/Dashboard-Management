from sqlalchemy.orm import Session
import models.models as models
import schemas
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from utilities.utils import parse_date
from datetime import datetime, timedelta
from sqlalchemy import func

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
        create_subscription(db, db_user.id, 1)
        return db_user
    except IntegrityError:
        db.rollback()
        raise Exception("User already exists!")

def create_product(db: Session, product: schemas.ProductCreate):
    normalized_date = None
    if product.soldDate:
        try:
            normalized_date = parse_date(str(product.soldDate))
        except ValueError as e:
            raise Exception(f"Invalid date format for soldDate: {e}")

    db_product = models.Product(
        productName=product.productName.capitalize() if product.productName else product.productName,
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
        if key == 'productName':
            value = value.capitalize() if value else value
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
    today = datetime.now().date()
    try:
        if len(period) == 7 and period[4] == '-':
            from datetime import datetime, timedelta
            year = int(period[:4])
            month = int(period[5:7])
            start_date = datetime(year, month, 1).date()
            if month == 12:
                end_date = datetime(year + 1, 1, 1).date()
            else:
                end_date = datetime(year, month + 1, 1).date()

            results = db.query(
                models.Product.soldDate,
                func.sum((models.Product.sellingPrice - models.Product.discounts) * models.Product.quantity).label('sales'),
                func.sum((models.Product.sellingPrice - models.Product.productPrice - models.Product.discounts) * models.Product.quantity).label('profit')
            ).filter(
                models.Product.soldDate >= start_date,
                models.Product.soldDate < end_date,
                models.Product.userId == user_id
            ).group_by(models.Product.soldDate).all()

            data_dict = {str(r.soldDate): {'sales': float(r.sales), 'profit': float(r.profit)} for r in results}
            all_days = []
            current = start_date
            while current < end_date:
                day_str = str(current)
                all_days.append({
                    'date': day_str,
                    'sales': data_dict.get(day_str, {}).get('sales', 0.0),
                    'profit': data_dict.get(day_str, {}).get('profit', 0.0)
                })
                current += timedelta(days=1)

            return all_days
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

def get_stats(db: Session, user_id: int):
    products = db.query(models.Product).filter(models.Product.userId == user_id).all()
    if not products:
        return {
            "totalSales": 0,
            "totalProfit": 0,
            "avgRating": 0,
            "totalOrders": 0,
            "totalQuantity": 0,
            "highestSellingProduct": None,
            "highestProfitProduct": None,
            "avgDiscount": 0
        }

    total_sales = sum(p.sellingPrice * p.quantity for p in products)
    total_profit = sum((p.sellingPrice - p.productPrice) * p.quantity for p in products)
    ratings = [p.ratings for p in products if p.ratings is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    total_orders = len(products)
    total_quantity = sum(p.quantity for p in products)
    highest_selling = max(products, key=lambda p: p.sellingPrice * p.quantity)
    highest_profit = max(products, key=lambda p: (p.sellingPrice - p.productPrice) * p.quantity)
    discounts = [float(p.discounts) for p in products if p.discounts]
    avg_discount = sum(discounts) / len(discounts) if discounts else 0

    return {
        "totalSales": total_sales,
        "totalProfit": total_profit,
        "avgRating": avg_rating,
        "totalOrders": total_orders,
        "totalQuantity": total_quantity,
        "highestSellingProduct": {
            "id": highest_selling.id,
            "productName": highest_selling.productName.capitalize() if highest_selling.productName else highest_selling.productName
        },
        "highestProfitProduct": {
            "id": highest_profit.id,
            "productName": highest_profit.productName.capitalize() if highest_profit.productName else highest_profit.productName
        },
        "avgDiscount": avg_discount
    }

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    for key, value in user.dict().items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_products_paginated(db: Session, user_id: int, page: int = 1, limit: int = 10):
    offset = (page - 1) * limit
    products = db.query(models.Product).filter(models.Product.userId == user_id).order_by(models.Product.soldDate.desc()).offset(offset).limit(limit).all()
    total = db.query(models.Product).filter(models.Product.userId == user_id).count()
    return products, total

def get_all_plans(db: Session):
    return db.query(models.Plan).all()

def update_user_plan(db: Session, user_id: int, plan_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    db_plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not db_plan:
        return None
    end_date = datetime.now() + timedelta(days=30)
    upt_subscription = update_subscription(db, user_id, plan_id, end_date)
    subscription = create_subscription(db, user_id, plan_id, end_date)
    return subscription

def get_user_current_plan(db: Session, user_id: int):
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id,
        models.Subscription.status == 1
    ).order_by(models.Subscription.start_date.desc()).first()

    if not db_subscription or (db_subscription.end_date and db_subscription.end_date < datetime.now()):
        return None

    plan = db.query(models.Plan).filter(models.Plan.id == db_subscription.plan_id).first()
    if not plan:
        return None

    return {
        "id": plan.id,
        "name": plan.name,
        "price": plan.price,
        "description": plan.description,
        "features": plan.features,
        "expiry": db_subscription.end_date
    }

def create_subscription(db: Session, user_id: int, plan_id: int, end_date: datetime = None):
    db_subscription = models.Subscription(
        user_id=user_id,
        plan_id=plan_id,
        start_date=datetime.now(),
        end_date=end_date,
        status=1
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def update_subscription(db: Session, user_id: int, plan_id: int, end_date: datetime):
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id,
        models.Subscription.status == 1
    ).first()
    if db_subscription:
        db_subscription.status = 0
        db.commit()
        db.refresh(db_subscription)
        return db_subscription
    return None