import os
import time
from transformers import pipeline

# Ensure we are online for this script
if "TRANSFORMERS_OFFLINE" in os.environ:
    del os.environ["TRANSFORMERS_OFFLINE"]
if "HF_HUB_OFFLINE" in os.environ:
    del os.environ["HF_HUB_OFFLINE"]

# Use a Hugging Face mirror to bypass the WinError 10054 firewall block
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

model_name = "Smogy/SMOGY-Ai-images-detector"
max_retries = 5

print(f"Starting download of {model_name}...")

for attempt in range(1, max_retries + 1):
    try:
        print(f"Attempt {attempt}/{max_retries}...")
        # Load the model. This will trigger the download and cache it locally.
        classifier = pipeline("image-classification", model=model_name)
        print("Download successful and model cached!")
        break
    except Exception as e:
        print(f"Attempt {attempt} failed: {e}")
        if attempt < max_retries:
            print("Retrying in 5 seconds...")
            time.sleep(5)
        else:
            print("All attempts failed. Please check your network connection.")
