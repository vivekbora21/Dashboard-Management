from sqlalchemy.orm import Session
from database import SessionLocal
import models

def assign_free_plan_to_existing_users():
    db = SessionLocal()
    try:
        # Get all users
        users = db.query(models.User).all()
        for user in users:
            # Check if user already has a plan
            existing_plan = db.query(models.UserPlan).filter(models.UserPlan.user_id == user.id).first()
            if not existing_plan:
                # Assign free plan
                user_plan = models.UserPlan(
                    user_id=user.id,
                    plan_id=1,  # Free plan
                    expiry=None,
                    status="active"
                )
                db.add(user_plan)
        db.commit()
        print("Free plans assigned to existing users.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    assign_free_plan_to_existing_users()
