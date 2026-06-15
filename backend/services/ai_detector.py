import os

# Force HuggingFace to run 100% locally to prevent internet connection errors
os.environ["HF_HUB_OFFLINE"] = "1"

from transformers import pipeline
import torch
from PIL import Image

# Initialize the pipeline globally so it's loaded only once
image_classifier = None

def get_classifier():
    global image_classifier
    if image_classifier is None:
        device = 0 if torch.cuda.is_available() else -1
        model_name = "Smogy/SMOGY-Ai-images-detector"
        print(f"Loading AI Image Detector from HF: {model_name}...")
        
        try:
            image_classifier = pipeline("image-classification", model=model_name, device=device)
            print("Successfully loaded model!")
        except Exception as e:
            print(f"Failed to load AI model: {e}")
            return None
    return image_classifier

def detect_ai(image_path):
    """
    Predicts if an image is AI generated or authentic.
    Returns: {"label": "artificial" | "human", "confidence": float}
    """
    classifier = get_classifier()
    if not classifier:
        return {"label": "error", "confidence": 0.0, "message": "Model not loaded"}
        
    try:
        # Load image
        img = Image.open(image_path).convert('RGB')
        
        # Predict
        results = classifier(img)
        
        # We sort by score to get the top prediction
        top_result = sorted(results, key=lambda x: x['score'], reverse=True)[0]
        
        # Map labels from new model ("fake" / "real") to frontend expected format
        raw_label = top_result['label'].lower()
        if any(w in raw_label for w in ["fake", "ai", "artificial", "synthetic", "generated"]):
            label = "artificial"
        elif any(w in raw_label for w in ["real", "human", "authentic", "natural", "original"]):
            label = "human"
        else:
            label = raw_label
            
        confidence = top_result['score'] * 100
        
        return {
            "label": label,
            "confidence": confidence
        }
        
    except Exception as e:
        print(f"Error during AI prediction: {e}")
        return {"label": "error", "confidence": 0.0, "message": str(e)}
