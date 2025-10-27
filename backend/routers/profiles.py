from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_current_user
import validation
import database.crud as crud
from database.database import get_db
import schemas
import models.models as models


router = APIRouter(prefix="", tags=["Profile"])

@router.get("/user/profile", response_model=schemas.UserOut)
def get_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

# Update user profile
@router.put("/user/profile", response_model=schemas.UserOut)
def update_user_profile(user: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    validation.validate_update_user(db, current_user.id, user)
    updated_user = crud.update_user(db, current_user.id, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user
