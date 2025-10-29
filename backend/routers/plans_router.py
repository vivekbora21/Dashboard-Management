from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models.models as models
import schemas.schemas as schemas
import database.crud as crud
from auth.auth import get_current_user
from database.database import get_db
from utilities.email_utils import send_html_email, render_template
import os

router = APIRouter(prefix="", tags=["plan"])

@router.get("/plans", response_model=List[schemas.PlanOut])
def get_plans(db: Session = Depends(get_db)):
    plans = crud.get_all_plans(db)
    return plans

@router.put("/users/{user_id}/plan/{plan_id}")
def assign_plan_to_user(user_id: int, plan_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    subscription = crud.update_user_plan(db, user_id, plan_id)
    if not subscription:
        raise HTTPException(status_code=404, detail="User or Plan not found")

    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
        html_content = render_template('subscription_confirmation.html',
                                       firstName=user.firstName,
                                       lastName=user.lastName,
                                       planName=plan.name,
                                       planPrice=plan.price,
                                       expiryDate=subscription.end_date.strftime("%Y-%m-%d") if subscription.end_date else "N/A",
                                       planFeatures=plan.features or "Standard features")
        send_html_email(to_email=user.email, subject="Subscription Confirmed!", html_content=html_content)
    except Exception as e:
        print(f"Failed to send subscription confirmation email: {e}")

    return {"message": f"Plan {plan_id} assigned to user {user_id}"}

@router.get("/users/{user_id}/current-plan", response_model=schemas.UserPlanOut)
def get_user_current_plan(user_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = crud.get_user_current_plan(db, user_id)
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan")
    return plan
