from fastapi import FastAPI, Depends, HTTPException, status, Response, Request, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, get_db
from utils import parse_date
from routers.plans_router import router as plans_router
from typing import List
import pandas as pd
from datetime import datetime, date
import models
import schemas 
import auth
import otp_utils
import email_utils
import io
import crud
import routers.kpis as kpis
import routers.users as users
import validation
import os
import routers.plans as plans
import routers.products as products
import routers.statistics as statistics

app = FastAPI(title="Sales Manager API")
app.include_router(statistics.router)
app.include_router(plans_router)
app.include_router(kpis.router)
app.include_router(users.router)
app.include_router(plans.router)
app.include_router(products.router)
models.Base.metadata.create_all(bind=engine)
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
    validation.validate_signup(db, user)
    hashed_pw = auth.hash_password(user.password)
    new_user = models.User(
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email.lower(),
        phone=user.phone,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    crud.create_subscription(db, new_user.id, 1)

#Login
@app.post("/login/")
def login(user: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = validation.validate_login(db, user)
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

# Logout
@app.post("/logout/")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

@app.post("/upload-excel/")
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

    df = df.head(MAX_ROWS)
    inserted_products = []
    for index, row in df.iterrows():
        try:
            soldDate = excel_date_to_date(row.get("soldOn"))
            product_data = models.Product(
                productName=row.get("productName").capitalize() if row.get("productName") else row.get("productName"),
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

# Forgot Password
@app.post("/forgot-password/")
def forgot_password(request: dict, db: Session = Depends(get_db)):
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = otp_utils.generate_otp()
    otp_utils.save_otp(db, user.id, otp)
    email_utils.send_otp_email(email, otp)

    return {"message": "OTP sent to your email"}

# Verify OTP
@app.post("/verify-otp/")
def verify_otp(request: dict, db: Session = Depends(get_db)):
    email = request.get("email")
    otp = request.get("otp")
    if not email or not otp:
        raise HTTPException(status_code=400, detail="Email and OTP are required")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not otp_utils.verify_otp(db, user.id, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    reset_token = auth.create_reset_token(email)
    return {"reset_token": reset_token}

# Reset Password
@app.post("/reset-password/")
def reset_password(request: dict, db: Session = Depends(get_db)):
    reset_token = request.get("reset_token")
    new_password = request.get("new_password")
    if not reset_token or not new_password:
        raise HTTPException(status_code=400, detail="Reset token and new password are required")

    try:
        email = auth.verify_reset_token(reset_token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_pw = auth.hash_password(new_password)
    user.hashed_password = hashed_pw
    db.commit()

    return {"message": "Password reset successfully"}
