from fastapi import FastAPI, Depends, HTTPException, status
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

origins = ["http://localhost:3001","http://127.0.0.1:3001"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Signup
@app.post("/signup/", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_pw = auth.hash_password(user.password)

    # Create user
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
    return new_user

#Login
@app.post("/login/")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify password
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # If valid, return user info (or token for production)
    return {"message": "Login successful", "user": {
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
def get_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

