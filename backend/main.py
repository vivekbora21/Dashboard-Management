from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import models
import schemas
import auth
import crud
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

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
    # Check if user exists
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

    # Verify password
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Create access token
    access_token = auth.create_access_token(data={"sub": db_user.email})

    # Set token as HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    # Return user info without token
    return {"user": {
        "id": db_user.id,
        "firstName": db_user.firstName,
        "lastName": db_user.lastName,
        "email": db_user.email,
        "phone": db_user.phone
    }}

# Manual Product Update
@app.post("/manual-update/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def manual_update(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        new_product = crud.create_product(db, product)
        return new_product
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get all products
@app.get("/products/", response_model=List[schemas.ProductOut])
def get_products(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_products(db)

# Update product
@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_product = crud.update_product(db, product_id, product)
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
    success = crud.delete_product(db, product_id)
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
    products = crud.get_products_by_date(db, date)
    return products

# Get summary for period
@app.get("/products/summary")
def get_summary(
    period: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = crud.get_summary(db, period)
    return summary

