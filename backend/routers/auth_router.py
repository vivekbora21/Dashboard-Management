from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, User
from auth import hash_password, create_access_token, get_token_from_cookie, verify_token
from validation import validate_signup, validate_login
import crud

router = APIRouter()

def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = get_token_from_cookie(request)
    if not token:
        raise credentials_exception
    email = verify_token(token, credentials_exception)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup/", status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    validate_signup(db, user)
    hashed_pw = hash_password(user.password)
    new_user = User(
        firstName=user.firstName,
        lastName=user.lastName,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

@router.post("/login/")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = validate_login(db, user)
    access_token = create_access_token(data={"sub": db_user.email})
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=1800,
        expires=1800,
    )
    return {"message": "Login successful"}

@router.get("/user/profile")
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_plan = crud.get_user_current_plan(db, current_user.id)
    return {
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "email": current_user.email,
        "phone": current_user.phone,
        "currentPlan": current_plan
    }

@router.put("/user/profile")
def update_user_profile(user: User, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.firstName = user.firstName
    current_user.lastName = user.lastName
    current_user.phone = user.phone
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully"}
