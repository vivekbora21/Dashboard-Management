from fastapi import APIRouter, Depends, status, Response
import schemas.schemas as schemas
import auth.auth as auth
from sqlalchemy.orm import Session
from database.database import get_db
import models.models as models
import schemas.validation as validation
import database.crud as crud

router = APIRouter(prefix="", tags=["users"])

@router.get("/users/me/")
def read_current_user(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.post("/signup/", status_code=status.HTTP_201_CREATED)
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

@router.post("/login/")
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
@router.post("/logout/")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}