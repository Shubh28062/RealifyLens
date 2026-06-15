import os
import uuid
import datetime
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
from extensions import mongo
from services.ai_detector import detect_ai
from services.ela_generator import generate_ela
from services.metadata_extractor import extract_metadata

analysis_bp = Blueprint("analysis", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@analysis_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_and_analyze():
    if "file" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Secure filename and add unique ID to prevent overwriting
        original_filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        filename = f"{unique_id}_{original_filename}"

        upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(upload_path)

        # Run Analysis
        # 1. AI Detection
        ai_result = detect_ai(upload_path)

        # 2. ELA Generation
        try:
            ela_filename = generate_ela(upload_path, current_app.config["ELA_FOLDER"])
        except Exception as e:
            print(f"ELA Generation failed: {e}")
            ela_filename = None

        # 3. Metadata Extraction
        metadata = extract_metadata(upload_path)

        # 4. Weighted Confidence Scoring System
        detections = metadata.get("analysis", {}).get("detections", [])
        red_flags = metadata.get("analysis", {}).get("red_flags", [])
        camera_info = metadata.get("analysis", {}).get("camera_info", {})
        
        # Only adjust if the AI model successfully returned a prediction
        if ai_result.get("label") in ["human", "artificial"]:
            confidence = ai_result["confidence"]
            label = ai_result["label"]
            
            # A. Authenticity Boosts
            has_authentic_camera = camera_info.get("make") and camera_info.get("model")
            has_editing_software = any("software" in r.lower() or "photoshop" in r.lower() or "adobe" in r.lower() or "edited" in r.lower() for r in red_flags)
            
            if has_authentic_camera and not has_editing_software:
                if label == "human":
                    confidence = min(99.9, confidence + 15.0)
                else:
                    confidence = max(0.1, confidence - 15.0)

            # B. Suspicion Penalties
            metadata_stripped = any("Metadata stripped" in d for d in detections)
            if metadata_stripped:
                if label == "human":
                    confidence = max(0.1, confidence - 20.0)
                else:
                    confidence = min(99.9, confidence + 10.0)
                    
            if has_editing_software:
                if label == "human":
                    confidence = max(0.1, confidence - 25.0)
                else:
                    confidence = min(99.9, confidence + 15.0)

            # Check if we should flip the label based on weighted confidence
            if confidence < 50.0:
                label = "artificial" if label == "human" else "human"
                confidence = 100.0 - confidence # Invert confidence for the new label
                
            # C. Hard Overrides (Absolute certainty)
            if any("Generated" in d for d in detections):
                label = "artificial"
                confidence = 99.9
                
            ai_result["label"] = label
            ai_result["confidence"] = round(confidence, 2)

        # Get User ID from JWT
        user_id = get_jwt_identity()

        # Save to MongoDB
        analysis_doc = {
            "user_id": user_id,
            "original_filename": original_filename,
            "saved_filename": filename,
            "ela_filename": ela_filename,
            "ai_result": ai_result,
            "metadata": metadata,
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        }

        analyses = mongo.db.analyses
        result = analyses.insert_one(analysis_doc)

        analysis_doc["_id"] = str(result.inserted_id)

        return (
            jsonify(
                {"message": "Analysis completed successfully", "analysis": analysis_doc}
            ),
            200,
        )

    return jsonify({"message": "File type not allowed"}), 400


@analysis_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    analyses_col = mongo.db.analyses

    # Fetch all analyses for this user, sorted by newest first
    cursor = analyses_col.find({"user_id": user_id}).sort("created_at", -1)

    history = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)

    return jsonify({"history": history}), 200

@analysis_bp.route("/<analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis(analysis_id):
    user_id = get_jwt_identity()
    analyses_col = mongo.db.analyses
    
    try:
        doc = analyses_col.find_one({"_id": ObjectId(analysis_id), "user_id": user_id})
        if doc:
            doc["_id"] = str(doc["_id"])
            return jsonify({"analysis": doc}), 200
        return jsonify({"message": "Analysis not found"}), 404
    except Exception:
        return jsonify({"message": "Invalid ID format"}), 400

@analysis_bp.route("/history/<analysis_id>", methods=["DELETE"])
@jwt_required()
def delete_history(analysis_id):
    user_id = get_jwt_identity()
    analyses_col = mongo.db.analyses
    
    try:
        result = analyses_col.delete_one({"_id": ObjectId(analysis_id), "user_id": user_id})
        if result.deleted_count == 1:
            return jsonify({"message": "History deleted successfully"}), 200
        else:
            return jsonify({"message": "History not found or unauthorized"}), 404
    except Exception as e:
        return jsonify({"message": "Invalid ID format"}), 400


# Route to serve the uploaded images
@analysis_bp.route("/image/<filename>")
def serve_image(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)


# Route to serve the ELA images
@analysis_bp.route("/ela/<filename>")
def serve_ela(filename):
    return send_from_directory(current_app.config["ELA_FOLDER"], filename)
