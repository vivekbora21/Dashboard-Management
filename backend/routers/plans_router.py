from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import crud
import auth
from database import get_db

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

router = APIRouter()

@router.get("/plans", response_model=List[schemas.PlanOut])
def get_plans(db: Session = Depends(get_db)):
    plans = crud.get_all_plans(db)
    return plans

@router.put("/users/{user_id}/plan/{plan_id}")
def assign_plan_to_user(user_id: int, plan_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    updated_user = crud.update_user_plan(db, user_id, plan_id)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User or Plan not found")
    return {"message": f"Plan {plan_id} assigned to user {user_id}"}

@router.get("/users/{user_id}/current-plan", response_model=schemas.UserPlanOut)
def get_user_current_plan(user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = crud.get_user_current_plan(db, user_id)
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan")
    return plan
