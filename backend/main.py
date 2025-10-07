from fastapi import FastAPI, Depends, HTTPException, status, Response, Request, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
from datetime import datetime, date
import models
import schemas
import auth
import io
import crud
from database import engine, get_db
from utils import parse_date
from statistics import router as statistics_router
import kpis

app = FastAPI()
app.include_router(statistics_router)
models.Base.metadata.create_all(bind=engine)
MAX_ROWS = 10

def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = auth.get_token_from_cookie(request)
    if not token:
        raise credentials_exception
    email = auth.verify_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def excel_date_to_date(excel_value):
    if isinstance(excel_value, datetime):
        return excel_value.date()
    elif isinstance(excel_value, date):
        return excel_value
    elif isinstance(excel_value, str):
        return parse_date(excel_value)
    else:
        return None

origins = ["http://localhost:3001","http://127.0.0.1:3001"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Signup
@app.post("/signup/", status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth.hash_password(user.password)

    new_user = models.User(
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

#Login
@app.post("/login/")
def login(user: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    access_token = auth.create_access_token(data={"sub": db_user.email})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, 
        samesite="lax",
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {"user": {
        "id": db_user.id,
        "firstName": db_user.firstName,
        "lastName": db_user.lastName,
        "email": db_user.email,
        "phone": db_user.phone
    }}

# Manual Product Update
@app.post("/manual-update/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def manual_update(product: schemas.ProductCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
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

# Get all products
@app.get("/products/")
def get_products(page: int = 1, limit: int = 10, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    products, total = crud.get_products_paginated(db, current_user.id, page, limit)
    return {"products": products, "total": total, "page": page, "limit": limit}

# Get stats
@app.get("/stats/")
def get_stats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_stats(db, current_user.id)

# Update product
@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_product = crud.update_product(db, product_id, product, current_user.id)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

# Delete product
@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_product(db, product_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Logout
@app.post("/logout/")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

# Get products by date
@app.get("/products/date/{date}", response_model=List[schemas.ProductOut])
def get_products_by_date(
    date: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = crud.get_products_by_date(db, date, current_user.id)
    return products

@app.get("/products/summary")
def get_summary(period: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    summary = crud.get_summary(db, period, current_user.id)
    return summary

# KPI Endpoints
@app.get("/kpi/total_sales")
def get_kpi_total_sales(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"value": kpis.get_total_sales(db, current_user.id)}

@app.get("/kpi/total_profit")
def get_kpi_total_profit(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"value": kpis.get_total_profit(db, current_user.id)}

@app.get("/kpi/avg_rating")
def get_kpi_avg_rating(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"value": kpis.get_avg_rating(db, current_user.id)}

@app.get("/kpi/total_orders")
def get_kpi_total_orders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"value": kpis.get_total_orders(db, current_user.id)}

@app.get("/kpi/total_quantity")
def get_kpi_total_quantity(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"value": kpis.get_total_quantity(db, current_user.id)}

@app.get("/kpi/highest_selling_product")
def get_kpi_highest_selling_product(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return kpis.get_highest_selling_product(db, current_user.id)

@app.get("/kpi/highest_profit_product")
def get_kpi_highest_profit_product(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return kpis.get_highest_profit_product(db, current_user.id)

@app.get("/kpi/avg_discount")
def get_kpi_avg_discount(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"value": kpis.get_avg_discount(db, current_user.id)}

@app.get("/kpi/top_profit_products")
def get_kpi_top_profit_products(limit: int = 5, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return kpis.get_top_profit_products(db, current_user.id, limit)

@app.post("/upload-excel/")
def upload_excel(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file type. Only Excel files are allowed.")

    try:
        df = pd.read_excel(io.BytesIO(file.file.read()))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")

    df = df.head(MAX_ROWS)
    inserted_products = []
    for index, row in df.iterrows():
        try:
            soldDate = excel_date_to_date(row.get("soldOn"))
            product_data = models.Product(
                productName=row.get("productName"),
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
            continue

    return {
        "message": f"{len(inserted_products)} products inserted successfully",
        "products": [p.productName for p in inserted_products]
    }