from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, get_db
from routers.plans_router import router as plans_router
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


# Logout
@app.post("/logout/")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

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
