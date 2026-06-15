import torch
from transformers import pipeline
from PIL import Image

try:
    classifier = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
    img = Image.new('RGB', (224, 224), color = 'red')
    res = classifier(img)
    print("MODEL LABELS ARE:", res)
except Exception as e:
    print("Error:", e)
