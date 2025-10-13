from sqlalchemy.orm import Session
from database import SessionLocal
import models
from crud import create_subscription

def assign_free_plan_to_existing_users():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        for user in users:
            existing_subscription = db.query(models.Subscription).filter(
                models.Subscription.user_id == user.id,
                models.Subscription.status == "active"
            ).first()
            if not existing_subscription:
                create_subscription(db, user.id, 1)
        db.commit()
        print("Free plans assigned to existing users via subscriptions.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    assign_free_plan_to_existing_users()
