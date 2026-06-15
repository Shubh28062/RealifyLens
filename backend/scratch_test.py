import torch
from transformers import pipeline
from PIL import Image

try:
    device = 0 if torch.cuda.is_available() else -1
    classifier = pipeline("image-classification", model="umm-maybe/AI-image-detector", device=device, local_files_only=True)
    img = Image.new('RGB', (224, 224), color = 'red')
    res = classifier(img)
    print("MODEL LABELS ARE:", res)
except Exception as e:
    print("Error:", e)
