from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from auth import get_current_user
from database.database import get_db
import database.crud as crud
import models.models as models


router = APIRouter(prefix="", tags=["User_plan"])

@router.get("/user/plan")
def get_user_plan(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_plan = crud.get_user_current_plan(db, current_user.id)
    print("Current plan fetched:", current_plan)
    if current_plan:
        return {"plan": current_plan["name"]}
    else:
        return {"plan": "free"}