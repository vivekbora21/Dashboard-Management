import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import jinja2

SMTP_EMAIL = "svivek1199@gmail.com"
SMTP_PASSWORD = "qlyv onbz vvmo dclq"

def send_otp_email(to_email: str, otp: str):
    subject = "Password Reset OTP"

    # Read the HTML template
    template_path = os.path.join(os.path.dirname(__file__), '..', 'templates', 'otp_reset.html')
    with open(template_path, 'r') as file:
        html_content = file.read()

    # Replace the placeholder with the actual OTP
    html_content = html_content.replace('{otp}', otp)

    send_html_email(to_email, subject, html_content)

def send_html_email(to_email: str, subject: str, html_content: str):
    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject

    # Attach the HTML content
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)

def render_template(template_name: str, **kwargs):
    template_path = os.path.join(os.path.dirname(__file__), '..', 'templates', template_name)
    with open(template_path, 'r') as file:
        template_content = file.read()
    template = jinja2.Template(template_content)
    return template.render(**kwargs)
