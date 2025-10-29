from fastapi import APIRouter, Depends, Request, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
import models.models as models
from database.database import get_db
from auth.auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/statistics", tags=["Statistics"])

def get_date_range(period: str):
    now = datetime.now()
    if period == 'day':
        start_date = now - timedelta(days=1)
    elif period == 'week':
        start_date = now - timedelta(weeks=1)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:  # 'all'
        return None, None
    return start_date, now

@router.get("/sales-trend")
def get_sales_trend(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        func.date_format(models.Product.soldDate, "%Y-%m").label("month"),
        func.sum(models.Product.sellingPrice * models.Product.quantity).label("sales"),
        func.sum(
            (models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity
        ).label("profit")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    sales_trend = query.group_by(func.date_format(models.Product.soldDate, "%Y-%m")).order_by("month").all()

    sales_trend_data = [
        {"month": m, "sales": float(s or 0), "profit": float(p or 0)} for m, s, p in sales_trend
    ]
    return sales_trend_data

@router.get("/category-distribution")
def get_category_distribution(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        models.Product.productCategory,
        func.sum(models.Product.sellingPrice * models.Product.quantity).label("total")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    category_distribution = query.group_by(models.Product.productCategory).all()
    category_distribution_data = [
        {"category": c, "value": float(t or 0)} for c, t in category_distribution
    ]
    return category_distribution_data

@router.get("/avg-ratings")
def get_avg_ratings(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        models.Product.productCategory,
        func.avg(models.Product.ratings).label("avg_rating")
    ).filter(models.Product.userId == user.id, models.Product.ratings != None, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    avg_ratings = query.group_by(models.Product.productCategory).all()
    avg_ratings_data = [
        {"productCategory": c, "avg_rating": round(r, 2) if r else 0} for c, r in avg_ratings
    ]
    return avg_ratings_data

@router.get("/profit-per-category")
def get_profit_per_category(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        models.Product.productCategory,
        func.sum(
            (models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity
        ).label("profit")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    profit_per_category = query.group_by(models.Product.productCategory).all()
    profit_per_category_data = [
        {"productCategory": c, "profit": float(p or 0)} for c, p in profit_per_category
    ]
    return profit_per_category_data

@router.get("/top-products")
def get_top_products(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    top_products = (
        db.query(models.Product.productName, func.sum(models.Product.quantity).label("total_sold"))
        .filter(models.Product.userId == user.id, models.Product.is_deleted == 0)
        .group_by(models.Product.productName)
        .order_by(func.sum(models.Product.quantity).desc())
        .limit(5)
        .all()
    )
    top_products_data = [
        {"productName": n.capitalize() if n else n, "quantity": int(q or 0)} for n, q in top_products
    ]
    return top_products_data

@router.get("/daily-sales")
def get_daily_sales(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(models.Product.soldDate, func.sum(models.Product.quantity).label("total")).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    daily_sales = query.group_by(models.Product.soldDate).order_by(models.Product.soldDate).all()
    daily_sales_data = [
        {"soldDate": str(d), "quantity": int(q or 0)} for d, q in daily_sales
    ]
    return daily_sales_data

@router.get("/profit-per-product")
def get_profit_per_product(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        models.Product.productName,
        func.sum((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).label("profit")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    profit_per_product = query.group_by(models.Product.productName).order_by(func.sum((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).desc()).all()

    profit_per_product_data = [
        {"productName": name.capitalize() if name else name, "profit": float(profit or 0)} for name, profit in profit_per_product
    ]
    return profit_per_product_data

@router.get("/total-revenue")
def get_total_revenue(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        func.date_format(models.Product.soldDate, "%Y-%m").label("month"),
        func.sum(models.Product.sellingPrice * models.Product.quantity).label("revenue")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    total_revenue = query.group_by(func.date_format(models.Product.soldDate, "%Y-%m")).order_by("month").all()

    total_revenue_data = [
        {"month": m, "revenue": float(r or 0)} for m, r in total_revenue
    ]
    return total_revenue_data

@router.get("/revenue-profit-margin-trend")
def get_revenue_profit_margin_trend(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        func.date_format(models.Product.soldDate, "%Y-%m").label("month"),
        func.sum(models.Product.sellingPrice * models.Product.quantity).label("revenue"),
        func.sum(
            (models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity
        ).label("profit")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    revenue_profit_data = query.group_by(func.date_format(models.Product.soldDate, "%Y-%m")).order_by("month").all()

    revenue_profit_margin_data = []
    for month, revenue, profit in revenue_profit_data:
        margin = (profit / revenue * 100) if revenue > 0 else 0
        revenue_profit_margin_data.append({
            "month": month,
            "revenue": float(revenue or 0),
            "profit_margin": round(margin, 2)
        })

    return revenue_profit_margin_data

@router.get("/sales-distribution-by-category")
def get_sales_distribution_by_category(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        models.Product.productCategory,
        func.sum(models.Product.sellingPrice * models.Product.quantity).label("sales")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    sales_distribution = query.group_by(models.Product.productCategory).all()
    sales_distribution_data = [
        {"category": c, "sales": float(s or 0)} for c, s in sales_distribution
    ]
    return sales_distribution_data

@router.get("/avg-profit-margin-per-category")
def get_avg_profit_margin_per_category(request: Request, period: str = Query("all", enum=["day", "week", "month", "year", "all"]), db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    start_date, end_date = get_date_range(period)
    query = db.query(
        models.Product.productCategory,
        func.sum(models.Product.sellingPrice * models.Product.quantity).label("revenue"),
        func.sum((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).label("profit")
    ).filter(models.Product.userId == user.id, models.Product.is_deleted == 0)

    if start_date and end_date:
        query = query.filter(and_(models.Product.soldDate >= start_date, models.Product.soldDate <= end_date))

    margin_data = query.group_by(models.Product.productCategory).all()

    avg_profit_margin_data = []
    for category, revenue, profit in margin_data:
        margin = (profit / revenue * 100) if revenue > 0 else 0
        avg_profit_margin_data.append({
            "category": category,
            "profit_margin": round(margin, 2)
        })

    return avg_profit_margin_data
