import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from extensions import mongo, jwt
from routes.auth import auth_bp
from routes.analysis import analysis_bp
from routes.ocr import ocr_bp
app = Flask(__name__)
CORS(app)

# Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/realifylens"
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config["ELA_FOLDER"] = os.path.join(os.path.dirname(__file__), 'ela_outputs')
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB limit

# Ensure folders exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(app.config["ELA_FOLDER"], exist_ok=True)

# Initialize extensions
mongo.init_app(app)
jwt.init_app(app)

from routes.user import user_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
app.register_blueprint(ocr_bp, url_prefix="/api/ocr")
app.register_blueprint(user_bp, url_prefix="/api/user")

from flask import send_from_directory

@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/ela_outputs/<path:filename>")
def serve_ela(filename):
    return send_from_directory(app.config["ELA_FOLDER"], filename)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "success", "message": "RealifyLens API is running!"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)
