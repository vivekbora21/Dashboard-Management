import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_EMAIL = "svivek1199@gmail.com"
SMTP_PASSWORD = "qlyv onbz vvmo dclq"

def send_otp_email(to_email: str, otp: str):
    subject = "Password Reset OTP"
    body = f"Your OTP for password reset is: {otp}\nIt will expire in 5 minutes."

    msg = MIMEMultipart()
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
