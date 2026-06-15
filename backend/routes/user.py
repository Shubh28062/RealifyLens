from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from extensions import mongo

user_bp = Blueprint("user", __name__)

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    users = mongo.db.users

    user = users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        return jsonify({"message": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify({"profile": user}), 200

@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    users = mongo.db.users

    data = request.get_json()
    
    # Allowed fields to update
    update_data = {}
    if "name" in data:
        update_data["name"] = data["name"]
    if "organization" in data:
        update_data["organization"] = data["organization"]
    if "role" in data:
        update_data["role"] = data["role"]
    if "badge_number" in data:
        update_data["badge_number"] = data["badge_number"]

    if not update_data:
        return jsonify({"message": "No valid fields provided to update"}), 400

    result = users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "Profile updated successfully", "updated_fields": update_data}), 200

from werkzeug.security import generate_password_hash, check_password_hash
import os
from flask import current_app

@user_bp.route("/password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    users = mongo.db.users

    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Current and new password are required"}), 400

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user["password"], current_password):
        return jsonify({"message": "Incorrect current password"}), 401

    hashed_password = generate_password_hash(new_password)
    users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_password}}
    )

    return jsonify({"message": "Password changed successfully"}), 200

@user_bp.route("/account", methods=["DELETE"])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    users = mongo.db.users
    analyses_col = mongo.db.analyses

    data = request.get_json()
    password = data.get("password")

    if not password:
        return jsonify({"message": "Password is required to delete account"}), 400

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Incorrect password"}), 401

    # Find and delete associated image files before deleting records
    user_analyses = analyses_col.find({"user_id": user_id})
    for analysis in user_analyses:
        try:
            if "saved_filename" in analysis:
                file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], analysis["saved_filename"])
                if os.path.exists(file_path):
                    os.remove(file_path)
            if "ela_filename" in analysis:
                ela_path = os.path.join(current_app.config["ELA_FOLDER"], analysis["ela_filename"])
                if os.path.exists(ela_path):
                    os.remove(ela_path)
        except Exception as e:
            print(f"Error deleting user files: {e}")

    # Delete all analysis records associated with the user
    analyses_col.delete_many({"user_id": user_id})

    # Delete the user account
    users.delete_one({"_id": ObjectId(user_id)})

    return jsonify({"message": "Account completely deleted"}), 200
