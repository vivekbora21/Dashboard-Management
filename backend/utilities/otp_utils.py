import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import OTP

def generate_otp():
    return str(random.randint(100000, 999999))

def save_otp(db: Session, user_id: int, otp: str):
    otp_entry = OTP(user_id=user_id, otp_code=otp, expires_at=datetime.utcnow() + timedelta(minutes=5))
    db.add(otp_entry)
    db.commit()
    db.refresh(otp_entry)
    return otp_entry

def verify_otp(db: Session, user_id: int, otp: str):
    otp_entry = db.query(OTP).filter(OTP.user_id == user_id, OTP.otp_code == otp).first()
    if not otp_entry:
        return False
    if datetime.utcnow() > otp_entry.expires_at:
        db.delete(otp_entry)
        db.commit()
        return False
    db.delete(otp_entry)
    db.commit()
    return True
