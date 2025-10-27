from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from database.database import get_db
from typing import List
import models.models as models
import auth.auth as auth
import database.crud as crud
import io
import schemas.schemas as schemas
import pandas as pd
from utilities.utils import parse_date
from datetime import date, datetime
import schemas.validation as validation


router = APIRouter(prefix="", tags=["products"])
MAX_ROWS = 10
def excel_date_to_date(excel_value):
    if isinstance(excel_value, datetime):
        return excel_value.date()
    elif isinstance(excel_value, date):
        return excel_value
    elif isinstance(excel_value, str):
        return parse_date(excel_value)
    else:
        return None

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

@router.post("/upload-excel/")
def upload_excel(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only Excel files are allowed.")

    try:
        df = pd.read_excel(io.BytesIO(file.file.read()))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")

    # Validate required columns
    required_columns = ["productName", "productCategory", "productPrice", "sellingPrice", "quantity"]
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing_columns)}")

    df = df.head(MAX_ROWS)
    errors = []
    for index, row in df.iterrows():
        row_errors = []
        row_num = index + 2  # Assuming header is row 1, data starts at row 2

        # Validate productName
        product_name = row.get("productName")
        if pd.isna(product_name) or not str(product_name).strip():
            row_errors.append("productName is required")

        # Validate productCategory
        product_category = row.get("productCategory")
        if pd.isna(product_category) or not str(product_category).strip():
            row_errors.append("productCategory is required")

        # Validate productPrice
        product_price = row.get("productPrice")
        if pd.isna(product_price):
            row_errors.append("productPrice is required")
        else:
            try:
                price = float(product_price)
                if price <= 0:
                    row_errors.append("productPrice must be greater than 0")
            except ValueError:
                row_errors.append("productPrice must be a valid number")

        # Validate sellingPrice
        selling_price = row.get("sellingPrice")
        if pd.isna(selling_price):
            row_errors.append("sellingPrice is required")
        else:
            try:
                sell_price = float(selling_price)
                if sell_price <= 0:
                    row_errors.append("sellingPrice must be greater than 0")
                elif not pd.isna(product_price) and sell_price < float(product_price):
                    row_errors.append("sellingPrice must be greater than or equal to productPrice")
            except ValueError:
                row_errors.append("sellingPrice must be a valid number")

        # Validate quantity
        quantity = row.get("quantity")
        if pd.isna(quantity):
            row_errors.append("quantity is required")
        else:
            try:
                qty = int(quantity)
                if qty <= 0:
                    row_errors.append("quantity must be greater than 0")
            except ValueError:
                row_errors.append("quantity must be a valid integer")

        # Validate ratings (optional)
        ratings = row.get("ratings")
        if not pd.isna(ratings):
            try:
                rating = float(ratings)
                if rating < 0 or rating > 5:
                    row_errors.append("ratings must be between 0 and 5")
            except ValueError:
                row_errors.append("ratings must be a valid number")

        # Validate soldDate (optional)
        sold_date = row.get("soldOn")
        if not pd.isna(sold_date):
            if excel_date_to_date(sold_date) is None:
                row_errors.append("soldOn must be a valid date")

        if row_errors:
            errors.append(f"Row {row_num}: {', '.join(row_errors)}")

    if errors:
        raise HTTPException(status_code=400, detail="Validation errors found in Excel file:\n" + "\n".join(errors))

    # If validation passes, insert products
    inserted_products = []
    for index, row in df.iterrows():
        try:
            soldDate = excel_date_to_date(row.get("soldOn"))
            product_data = models.Product(
                productName=str(row.get("productName")).capitalize() if row.get("productName") else str(row.get("productName")),
                productCategory=row.get("productCategory"),
                productPrice=float(row.get("productPrice")),
                sellingPrice=float(row.get("sellingPrice")),
                quantity=int(row.get("quantity")),
                userId=current_user.id,
                ratings=float(row.get("ratings")) if not pd.isna(row.get("ratings")) else None,
                discounts=row.get("discounts") if not pd.isna(row.get("discounts")) else None,
                soldDate=soldDate
            )
            db.add(product_data)
            db.commit()
            db.refresh(product_data)
            inserted_products.append(product_data)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error inserting product at row {index + 2}: {str(e)}")

    return {
        "message": f"{len(inserted_products)} products inserted successfully",
        "products": [p.productName for p in inserted_products]
    }

# Manual Product Update
@router.post("/manual-update/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def manual_update(product: schemas.ProductCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    validation.validate_add_product(product)
    try:
        product_dict = product.dict()
        product_dict['userId'] = current_user.id

        if product_dict.get('soldDate'):
            try:
                product_dict['soldDate'] = parse_date(str(product_dict['soldDate']))
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid date format for soldDate: {e}")

        product_with_user = schemas.ProductCreate(**product_dict)
        new_product = crud.create_product(db, product_with_user)
        return new_product
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))