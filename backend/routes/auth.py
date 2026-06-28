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

    # Send Email via EmailJS HTTP API
    try:
        import urllib.request
        import json
        
        payload = {
            "service_id": "service_4dgb9if",
            "template_id": "template_lngjvil",
            "user_id": "XPSOrt_W3BzNe-yZ-",
            "template_params": {
                "to_email": email,
                "email": email,
                "reply_to": email,
                "recipient": email,
                "otp": otp
            }
        }
        
        req = urllib.request.Request(
            'https://api.emailjs.com/api/v1.0/email/send',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0',
                'Origin': 'https://realify-lens.vercel.app'
            }
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            print(f"[SUCCESS] OTP Email successfully sent to {email} via EmailJS")
            
    except Exception as e:
        print(f"[ERROR] Failed to send email via EmailJS: {e}")
        return jsonify({"message": "Failed to connect to email server. Please try again."}), 500

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
