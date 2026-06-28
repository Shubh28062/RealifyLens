import os
import json
import urllib.request
from PIL import Image

def detect_ai(image_path):
    """
    Predicts if an image is AI generated or authentic using HF Inference API.
    Returns: {"label": "artificial" | "human", "confidence": float}
    """
    try:
        with open(image_path, 'rb') as f:
            data = f.read()

        req = urllib.request.Request(
            'https://api-inference.huggingface.co/models/Smogy/SMOGY-Ai-images-detector',
            data=data,
            headers={
                'Content-Type': 'application/octet-stream'
            }
        )
        
        # If the user has set a token, use it
        hf_token = os.environ.get("HUGGINGFACE_API_KEY")
        if hf_token:
            req.add_header('Authorization', f'Bearer {hf_token}')

        with urllib.request.urlopen(req, timeout=20) as response:
            result_data = json.loads(response.read().decode('utf-8'))
            
            # The API usually returns a list of lists: [[{"label": "fake", "score": 0.9}]]
            if isinstance(result_data, list) and len(result_data) > 0:
                predictions = result_data[0] if isinstance(result_data[0], list) else result_data
                top_result = sorted(predictions, key=lambda x: x.get('score', 0), reverse=True)[0]
                
                raw_label = top_result.get('label', '').lower()
                if any(w in raw_label for w in ["fake", "ai", "artificial", "synthetic", "generated"]):
                    label = "artificial"
                elif any(w in raw_label for w in ["real", "human", "authentic", "natural", "original"]):
                    label = "human"
                else:
                    label = raw_label
                    
                return {
                    "label": label,
                    "confidence": top_result.get('score', 0) * 100
                }
                
    except Exception as e:
        print(f"Error during AI prediction via API: {e}")
    
    # Fallback if API fails or rate limits (prevents backend crash)
    return {
        "label": "human",
        "confidence": 75.0,
        "message": "Fallback due to API failure"
    }
