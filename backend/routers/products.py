from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from typing import List
import models
import auth
import crud
import schemas


router = APIRouter(prefix="", tags=["products"])

@router.get("/products/")
def get_products(page: int = 1, limit: int = 10, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    products, total = crud.get_products_paginated(db, current_user.id, page, limit)
    return {"products": products, "total": total, "page": page, "limit": limit}

# Get stats
@router.get("/stats/")
def get_stats(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.get_stats(db, current_user.id)

# Update product
@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    updated_product = crud.update_product(db, product_id, product, current_user.id)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

# Delete product
@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_product(db, product_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Get products by date
@router.get("/products/date/{date}", response_model=List[schemas.ProductOut])
def get_products_by_date(
    date: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    products = crud.get_products_by_date(db, date, current_user.id)
    return products

@router.get("/products/summary")
def get_summary(period: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    summary = crud.get_summary(db, period, current_user.id)
    return summary