from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from extensions import mongo
import datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing email or password"}), 400

    users = mongo.db.users
    existing_user = users.find_one({"email": data["email"]})

    if existing_user:
        return jsonify({"message": "User already exists"}), 409

    hashed_password = generate_password_hash(data["password"])
    new_user = {
        "email": data["email"],
        "password": hashed_password,
        "name": data.get("name", ""),
        "created_at": datetime.datetime.utcnow(),
    }

    users.insert_one(new_user)
    return jsonify({"message": "User created successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Missing email or password"}), 400

    users = mongo.db.users
    user = users.find_one({"email": data["email"]})

    if user and check_password_hash(user["password"], data["password"]):
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

    return jsonify({"message": "Invalid credentials"}), 401

import random

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    if not data or not data.get("email"):
        return jsonify({"message": "Missing email"}), 400

    users = mongo.db.users
    user = users.find_one({"email": data["email"]})

    if not user:
        # Prevent email enumeration by returning a generic success message
        return jsonify({"message": "If an account exists, a reset code has been sent"}), 200

    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)

    users.update_one(
        {"email": data["email"]},
        {"$set": {"reset_otp": otp, "reset_otp_expiry": otp_expiry}}
    )

    # OPTION B: Real Email Sending via Gmail SMTP
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import os

    sender_email = os.environ.get("GMAIL_USER")
    app_password = os.environ.get("GMAIL_APP_PASSWORD")

    if sender_email and app_password:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"RealifyLens Security <{sender_email}>"
            msg['To'] = data["email"]
            msg['Subject'] = "Your Password Reset Code"
            
            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
                        <p style="color: #666; font-size: 16px;">We received a request to reset the password for your RealifyLens account. Enter the 6-digit code below to proceed:</p>
                        <div style="background-color: #f8f9fa; border: 2px dashed #ccc; padding: 15px; text-align: center; margin: 25px 0; border-radius: 8px;">
                            <h1 style="color: #ff9900; letter-spacing: 5px; margin: 0; font-size: 36px;">{otp}</h1>
                        </div>
                        <p style="color: #999; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
                    </div>
                </body>
            </html>
            """
            msg.attach(MIMEText(html, 'html'))
            
            # Connect to Gmail SMTP Server
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(sender_email, app_password)
            server.send_message(msg)
            server.quit()
            
            print(f"[SUCCESS] OTP Email successfully sent to {data['email']}")
        except Exception as e:
            print(f"[ERROR] Failed to send email: {e}")
    else:
        # Fallback if credentials aren't set
        print("=" * 50)
        print(f"🔒 PASSWORD RESET CODE FOR {data['email']}: {otp}")
        print("⚠️ WARNING: Email not sent because GMAIL_USER and GMAIL_APP_PASSWORD environment variables are not set.")
        print("=" * 50, flush=True)

    return jsonify({"message": "If an account exists, a reset code has been sent"}), 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    if not email or not otp or not new_password:
        return jsonify({"message": "Missing required fields"}), 400

    users = mongo.db.users
    user = users.find_one({"email": email})

    if not user or "reset_otp" not in user:
        return jsonify({"message": "Invalid or expired reset code"}), 400

    if user["reset_otp"] != otp:
        return jsonify({"message": "Invalid reset code"}), 400

    if datetime.datetime.utcnow() > user["reset_otp_expiry"]:
        return jsonify({"message": "Reset code has expired"}), 400

    hashed_password = generate_password_hash(new_password)
    
    users.update_one(
        {"email": email},
        {
            "$set": {"password": hashed_password},
            "$unset": {"reset_otp": "", "reset_otp_expiry": ""}
        }
    )

    return jsonify({"message": "Password reset successfully"}), 200
