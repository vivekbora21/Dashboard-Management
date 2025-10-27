from sqlalchemy.orm import Session
from sqlalchemy import func
import models.models as models
from datetime import datetime, timedelta
from auth import get_current_user
from fastapi import Depends, APIRouter, Request, HTTPException
from database.database import get_db

router = APIRouter(prefix="", tags=["kpi"])

def get_total_sales(db: Session, user_id: int):
    result = db.query(func.sum(models.Product.sellingPrice * models.Product.quantity))\
        .filter(models.Product.userId == user_id).scalar()
    return float(result or 0)

def get_total_profit(db: Session, user_id: int):
    result = db.query(func.sum((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity))\
        .filter(models.Product.userId == user_id).scalar()
    return float(result or 0)

def get_avg_rating(db: Session, user_id: int):
    result = db.query(func.avg(models.Product.ratings))\
        .filter(models.Product.userId == user_id, models.Product.ratings != None).scalar()
    return float(result or 0)

def get_total_orders(db: Session, user_id: int):
    result = db.query(func.count(models.Product.id))\
        .filter(models.Product.userId == user_id).scalar()
    return int(result or 0)

def get_total_quantity(db: Session, user_id: int):
    result = db.query(func.sum(models.Product.quantity))\
        .filter(models.Product.userId == user_id).scalar()
    return int(result or 0)

def get_highest_selling_product(db: Session, user_id: int):
    product = db.query(models.Product)\
        .filter(models.Product.userId == user_id)\
        .order_by((models.Product.sellingPrice * models.Product.quantity).desc())\
        .first()
    if product:
        return {"id": product.id, "productName": product.productName}
    return None

def get_highest_profit_product(db: Session, user_id: int):
    product = db.query(models.Product)\
        .filter(models.Product.userId == user_id)\
        .order_by(((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).desc())\
        .first()
    if product:
        return {"id": product.id, "productName": product.productName}
    return None

def get_avg_discount(db: Session, user_id: int):
    discounts = db.query(models.Product.discounts)\
        .filter(models.Product.userId == user_id, models.Product.discounts != None).all()
    discount_values = []
    for d in discounts:
        try:
            discount_values.append(float(d[0]))
        except (ValueError, TypeError):
            continue
    if discount_values:
        return sum(discount_values) / len(discount_values)
    return 0.0


def get_top_profit_products(db: Session, user_id: int, limit: int = 5):
    products = db.query(models.Product)\
        .filter(models.Product.userId == user_id)\
        .order_by(((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).desc())\
        .limit(limit).all()

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

def get_profit_margin(db: Session, user_id: int):
    total_sales = get_total_sales(db, user_id)
    total_profit = get_total_profit(db, user_id)
    return round((total_profit / total_sales) * 100, 2) if total_sales else 0.0

def get_avg_order_value(db: Session, user_id: int):
    total_sales = get_total_sales(db, user_id)
    total_orders = get_total_orders(db, user_id)
    return round(total_sales / total_orders, 2) if total_orders else 0.0

def get_top_category(db: Session, user_id: int):
    result = db.query(
        models.Product.productCategory,
        func.sum(models.Product.sellingPrice * models.Product.quantity).label("total_sales")
    ).filter(models.Product.userId == user_id)\
     .group_by(models.Product.productCategory)\
     .order_by(func.sum(models.Product.sellingPrice * models.Product.quantity).desc())\
     .first()

    return result.productCategory if result else None

def get_revenue_growth(db: Session, user_id: int):
    """Example: Compare last month’s total sales with the previous month’s."""
    today = datetime.utcnow().date()
    start_of_this_month = today.replace(day=1)
    start_of_last_month = (start_of_this_month - timedelta(days=1)).replace(day=1)

    this_month_sales = db.query(func.sum(models.Product.sellingPrice * models.Product.quantity))\
        .filter(models.Product.userId == user_id, models.Product.soldDate >= start_of_this_month).scalar() or 0

    last_month_sales = db.query(func.sum(models.Product.sellingPrice * models.Product.quantity))\
        .filter(models.Product.userId == user_id, models.Product.soldDate >= start_of_last_month, models.Product.soldDate < start_of_this_month).scalar() or 0

    if last_month_sales == 0:
        return 0.0
    return round(((this_month_sales - last_month_sales) / last_month_sales) * 100, 2)

@router.get("/total_sales")
def get_kpi_total_sales(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_total_sales(db, user.id)}

@router.get("/total_profit")
def get_kpi_total_profit(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_total_profit(db, user.id)}

@router.get("/avg_rating")
def get_kpi_avg_rating(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_avg_rating(db, user.id)}

@router.get("/total_orders")
def get_kpi_total_orders(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_total_orders(db, user.id)}

@router.get("/total_quantity")
def get_kpi_total_quantity(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_total_quantity(db, user.id)}

@router.get("/highest_selling_product")
def get_kpi_highest_selling_product(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return get_highest_selling_product(db, user.id)

@router.get("/highest_profit_product")
def get_kpi_highest_profit_product(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return get_highest_profit_product(db, user.id)

@router.get("/avg_discount")
def get_kpi_avg_discount(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_avg_discount(db, user.id)}

@router.get("/top_profit_products")
def get_kpi_top_profit_products(request: Request, limit: int = 5, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return get_top_profit_products(db, user.id, limit)

@router.get("/revenue_growth")
def get_kpi_revenue_growth(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_revenue_growth(db, user.id)}

@router.get("/profit_margin")
def get_kpi_profit_margin(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_profit_margin(db, user.id)}

@router.get("/avg_order_value")
def get_kpi_avg_order_value(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_avg_order_value(db, user.id)}

@router.get("/top_category")
def get_kpi_top_category(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return {"value": get_top_category(db, user.id)}
