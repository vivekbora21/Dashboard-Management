from sqlalchemy.orm import Session
from sqlalchemy import func
import models

def get_total_sales(db: Session, user_id: int):
    result = db.query(func.sum(models.Product.sellingPrice * models.Product.quantity)).filter(models.Product.userId == user_id).scalar()
    return float(result or 0)

def get_total_profit(db: Session, user_id: int):
    result = db.query(func.sum((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity)).filter(models.Product.userId == user_id).scalar()
    return float(result or 0)

def get_avg_rating(db: Session, user_id: int):
    result = db.query(func.avg(models.Product.ratings)).filter(models.Product.userId == user_id, models.Product.ratings != None).scalar()
    return float(result or 0)

def get_total_orders(db: Session, user_id: int):
    result = db.query(func.count(models.Product.id)).filter(models.Product.userId == user_id).scalar()
    return int(result or 0)

def get_total_quantity(db: Session, user_id: int):
    result = db.query(func.sum(models.Product.quantity)).filter(models.Product.userId == user_id).scalar()
    return int(result or 0)

def get_highest_selling_product(db: Session, user_id: int):
    product = db.query(models.Product).filter(models.Product.userId == user_id).order_by((models.Product.sellingPrice * models.Product.quantity).desc()).first()
    if product:
        return {"id": product.id, "productName": product.productName}
    return None

def get_highest_profit_product(db: Session, user_id: int):
    product = db.query(models.Product).filter(models.Product.userId == user_id).order_by(((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).desc()).first()
    if product:
        return {"id": product.id, "productName": product.productName}
    return None

def get_avg_discount(db: Session, user_id: int):
    result = db.query(func.avg(models.Product.discounts)).filter(models.Product.userId == user_id, models.Product.discounts != None).scalar()
    return float(result or 0)

def get_top_profit_products(db: Session, user_id: int, limit: int = 5):
    products = db.query(models.Product).filter(models.Product.userId == user_id).order_by(((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).desc()).limit(limit).all()
    return [
        {
            "id": p.id,
            "productName": p.productName,
            "productCategory": p.productCategory,
            "productPrice": p.productPrice,
            "quantity": p.quantity,
            "sellingPrice": p.sellingPrice,
            "ratings": p.ratings,
            "soldDate": str(p.soldDate),
            "profit": (p.sellingPrice - p.productPrice) * p.quantity
        } for p in products
    ]
