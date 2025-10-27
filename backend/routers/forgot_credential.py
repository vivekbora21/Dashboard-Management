from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models.models as models
import auth
import utilities.otp_utils as otp_utils
import utilities.email_utils as email_utils
from database.database import get_db

router = APIRouter(prefix="", tags=["Forgot Credential"])

# Forgot Password
@router.post("/forgot-password/")
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
@router.post("/verify-otp/")
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
@router.post("/reset-password/")
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
