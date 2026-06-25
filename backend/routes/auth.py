from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import mongo
import datetime
import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/request-otp", methods=["POST"])
def request_otp():
    data = request.get_json()
    if not data or not data.get("email"):
        return jsonify({"message": "Missing email"}), 400

    email = data["email"].lower().strip()
    users = mongo.db.users
    user = users.find_one({"email": email})

    # If user doesn't exist, register them implicitly
    if not user:
        new_user = {
            "email": email,
            "name": "",
            "created_at": datetime.datetime.utcnow(),
        }
        users.insert_one(new_user)
        user = users.find_one({"email": email})

    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)

    users.update_one(
        {"email": email},
        {"$set": {"login_otp": otp, "login_otp_expiry": otp_expiry}}
    )

    # Send Email via Gmail SMTP
    sender_email = os.environ.get("GMAIL_USER")
    app_password = os.environ.get("GMAIL_APP_PASSWORD")

    if sender_email and app_password:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"RealifyLens Security <{sender_email}>"
            msg['To'] = email
            msg['Subject'] = "Your RealifyLens Login Code"
            
            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center;">Sign In to RealifyLens</h2>
                        <p style="color: #666; font-size: 16px;">Here is your secure 6-digit login code. Enter this code to access your dashboard:</p>
                        <div style="background-color: #f8f9fa; border: 2px dashed #ccc; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
                            <h1 style="color: #ff9900; letter-spacing: 5px; margin: 0; font-size: 36px;">{otp}</h1>
                        </div>
                        <p style="color: #999; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
                    </div>
                </body>
            </html>
            """
            msg.attach(MIMEText(html, 'html'))
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(sender_email, app_password)
            server.send_message(msg)
            server.quit()
            
            print(f"[SUCCESS] OTP Email successfully sent to {email}")
        except Exception as e:
            print(f"[ERROR] Failed to send email: {e}")
            return jsonify({"message": "Failed to send email. Please check server logs."}), 500
    else:
        # Fallback if credentials aren't set
        print("=" * 50)
        print(f"🔒 LOGIN CODE FOR {email}: {otp}")
        print("⚠️ WARNING: Email not sent because GMAIL_USER and GMAIL_APP_PASSWORD environment variables are not set.")
        print("=" * 50, flush=True)

    return jsonify({"message": "A 6-digit code has been sent to your email"}), 200


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"message": "Missing email or code"}), 400
        
    email = email.lower().strip()

    users = mongo.db.users
    user = users.find_one({"email": email})

    if not user or "login_otp" not in user:
        return jsonify({"message": "Invalid or expired code"}), 401

    if user["login_otp"] != otp:
        return jsonify({"message": "Invalid 6-digit code"}), 401

    if datetime.datetime.utcnow() > user["login_otp_expiry"]:
        return jsonify({"message": "This code has expired. Please request a new one."}), 401
    
    # OTP is valid! Clear it out.
    users.update_one(
        {"email": email},
        {
            "$unset": {"login_otp": "", "login_otp_expiry": ""}
        }
    )

    access_token = create_access_token(identity=str(user["_id"]))
    
    return (
        jsonify(
            {
                "message": "Login successful",
                "access_token": access_token,
                "user": {"email": user["email"], "name": user.get("name", "")},
            }
        ),
        200,
    )
