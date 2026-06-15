import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import mongo
from bson.objectid import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
import easyocr

ocr_bp = Blueprint("ocr", __name__)

# Initialize the EasyOCR reader globally so it's loaded only once
# We'll support English by default
reader = None

def get_ocr_reader():
    global reader
    if reader is None:
        try:
            # Added Hindi ('hi') and Nepali ('ne') for Devanagari script support
            reader = easyocr.Reader(['en', 'hi', 'ne'], verbose=False)
        except Exception as e:
            print(f"Failed to load EasyOCR: {e}")
    return reader

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@ocr_bp.route("/extract-text", methods=["POST"])
def extract_text():
    if "file" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if file and allowed_file(file.filename):
        try:
            # We don't need to save it permanently, we can just read the bytes 
            # and pass them to EasyOCR. EasyOCR can read from bytes directly.
            file_bytes = file.read()
            
            ocr_reader = get_ocr_reader()
            if not ocr_reader:
                return jsonify({"message": "OCR engine not available"}), 500

            # Perform OCR on the image bytes using advanced parameters for better accuracy and layout
            results = ocr_reader.readtext(
                file_bytes,
                decoder='beamsearch',
                beamWidth=5,
                adjust_contrast=0.5,   # Fix low contrast images
                mag_ratio=2.0,         # Upscale image for better detection
                width_ths=0.7,         # Adjust text block grouping
                detail=0,              # Return just strings, not bounding boxes
                paragraph=True         # Group words into proper sentences/paragraphs
            )
            
            full_text = ""
            if results:
                # Since detail=0 and paragraph=True, results is just a list of paragraph strings
                full_text = "\n\n".join(results)

            return jsonify({"text": full_text}), 200

        except Exception as e:
            print(f"OCR processing failed: {e}")
            return jsonify({"message": "Failed to process image for OCR"}), 500

    return jsonify({"message": "File type not allowed"}), 400

@ocr_bp.route("/analyze/<analysis_id>", methods=["GET"])
@jwt_required()
def analyze_existing_image(analysis_id):
    user_id = get_jwt_identity()
    analyses_col = mongo.db.analyses

    try:
        doc = analyses_col.find_one({"_id": ObjectId(analysis_id), "user_id": user_id})
        if not doc:
            return jsonify({"message": "Analysis not found"}), 404
        
        # Check if OCR was already run and cached
        if "extracted_text" in doc:
            return jsonify({"text": doc["extracted_text"]}), 200

        filename = doc.get("saved_filename")
        if not filename:
            return jsonify({"message": "Image file missing"}), 404

        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        if not os.path.exists(file_path):
            return jsonify({"message": "Image file not found on disk"}), 404

        ocr_reader = get_ocr_reader()
        if not ocr_reader:
            return jsonify({"message": "OCR engine not available"}), 500

        # Use advanced parameters to significantly boost accuracy for complex scripts like Devanagari
        results = ocr_reader.readtext(
            file_path,
            decoder='beamsearch',
            beamWidth=5,
            adjust_contrast=0.5,   # Fix low contrast images
            mag_ratio=2.0,         # Upscale image for better detection
            width_ths=0.7,         # Adjust text block grouping
            detail=0,              # Return just strings, not bounding boxes
            paragraph=True         # Group words into proper sentences/paragraphs
        )
        
        full_text = ""
        if results:
            # Since detail=0 and paragraph=True, results is just a list of paragraph strings
            full_text = "\n\n".join(results)
            
        # Cache the result in DB
        analyses_col.update_one(
            {"_id": ObjectId(analysis_id)},
            {"$set": {"extracted_text": full_text}}
        )

        return jsonify({"text": full_text}), 200

    except Exception as e:
        print(f"OCR analysis failed: {e}")
        return jsonify({"message": "Failed to run OCR on image"}), 500
