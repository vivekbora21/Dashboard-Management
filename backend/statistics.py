from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/statistics", tags=["Statistics"])

@router.get("/")
def get_user_statistics(request: Request, db: Session = Depends(get_db)):
    try:
        user = get_current_user(request, db)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    sales_trend = (
        db.query(
            func.date_format(models.Product.soldDate, "%Y-%m").label("month"),
            func.sum(models.Product.sellingPrice * models.Product.quantity).label("sales"),
            func.sum(
                (models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity
            ).label("profit")
        )
        .filter(models.Product.userId == user.id)
        .group_by(func.date_format(models.Product.soldDate, "%Y-%m"))
        .order_by("month")
        .all()
    )

    sales_trend_data = [
        {"month": m, "sales": float(s or 0), "profit": float(p or 0)} for m, s, p in sales_trend
    ]
    category_distribution = (
        db.query(
            models.Product.productCategory,
            func.sum(models.Product.sellingPrice * models.Product.quantity).label("total")
        )
        .filter(models.Product.userId == user.id)
        .group_by(models.Product.productCategory)
        .all()
    )
    category_distribution_data = [
        {"category": c, "value": float(t or 0)} for c, t in category_distribution
    ]

    avg_ratings = (
        db.query(
            models.Product.productCategory,
            func.avg(models.Product.ratings).label("avg_rating")
        )
        .filter(models.Product.userId == user.id, models.Product.ratings != None)
        .group_by(models.Product.productCategory)
        .all()
    )
    avg_ratings_data = [
        {"productCategory": c, "avg_rating": round(r, 2) if r else 0} for c, r in avg_ratings
    ]

    profit_per_category = (
        db.query(
            models.Product.productCategory,
            func.sum(
                (models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity
            ).label("profit")
        )
        .filter(models.Product.userId == user.id)
        .group_by(models.Product.productCategory)
        .all()
    )
    profit_per_category_data = [
        {"productCategory": c, "profit": float(p or 0)} for c, p in profit_per_category
    ]

    top_products = (
        db.query(models.Product.productName, func.sum(models.Product.quantity).label("total_sold"))
        .filter(models.Product.userId == user.id)
        .group_by(models.Product.productName)
        .order_by(func.sum(models.Product.quantity).desc())
        .limit(5)
        .all()
    )
    top_products_data = [
        {"productName": n, "quantity": int(q or 0)} for n, q in top_products
    ]

    profit_per_product = (
        db.query(
            models.Product.productName,
            func.sum((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).label("profit")
        )
        .filter(models.Product.userId == user.id)
        .group_by(models.Product.productName)
        .order_by(func.sum((models.Product.sellingPrice - models.Product.productPrice) * models.Product.quantity).desc())
        .all()
    )

    profit_per_product_data = [
        {"productName": name, "profit": float(profit or 0)} for name, profit in profit_per_product
        ]

    daily_sales = (
        db.query(models.Product.soldDate, func.sum(models.Product.quantity).label("total"))
        .filter(models.Product.userId == user.id)
        .group_by(models.Product.soldDate)
        .order_by(models.Product.soldDate)
        .all()
    )
    daily_sales_data = [
        {"soldDate": str(d), "quantity": int(q or 0)} for d, q in daily_sales
    ]

    return {
        "sales_trend": sales_trend_data,
        "category_distribution": category_distribution_data,
        "avg_ratings": avg_ratings_data,
        "profit_per_category": profit_per_category_data,
        "top_products": top_products_data,
        "daily_sales": daily_sales_data,
        "profit_per_product": profit_per_product_data,
    }
