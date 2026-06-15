import os
import cv2
import numpy as np
from PIL import Image

def generate_ela(original_path, ela_folder, quality=90, scale=15):
    """
    Generates an Error Level Analysis (ELA) image.
    Saves a recompressed version, computes difference, and enhances it.
    Returns the filename of the generated ELA image.
    """
    filename = os.path.basename(original_path)
    temp_path = os.path.join(ela_folder, f"temp_{filename}")
    ela_filename = f"ela_{filename}"
    ela_path = os.path.join(ela_folder, ela_filename)
    
    # 1. Open original image and save it at a given quality level
    im = Image.open(original_path).convert('RGB')
    im.save(temp_path, 'JPEG', quality=quality)
    
    # 2. Open the original and the recompressed images using OpenCV
    original_cv = cv2.imread(original_path)
    recompressed_cv = cv2.imread(temp_path)
    
    # Handle if images couldn't be loaded properly
    if original_cv is None or recompressed_cv is None:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise ValueError("Error loading image for ELA")
        
    # Make sure sizes match in case of minor discrepancies
    if original_cv.shape != recompressed_cv.shape:
        recompressed_cv = cv2.resize(recompressed_cv, (original_cv.shape[1], original_cv.shape[0]))
        
    # 3. Calculate absolute difference
    diff = cv2.absdiff(original_cv, recompressed_cv)
    
    # 4. Enhance the difference (scale it up to make it visible)
    # We take the maximum pixel value across all channels
    max_diff = np.max(diff)
    if max_diff == 0:
        max_diff = 1 # Prevent division by zero
    
    # Scale to 255
    diff_enhanced = diff * (255.0 / max_diff)
    
    # Convert to 8-bit unsigned integer
    diff_enhanced = np.uint8(diff_enhanced)
    
    # Apply a colormap for better visualization (heatmap style)
    ela_heatmap = cv2.applyColorMap(diff_enhanced, cv2.COLORMAP_JET)
    
    # 5. Save the output
    cv2.imwrite(ela_path, ela_heatmap)
    
    # Clean up temp file
    if os.path.exists(temp_path):
        os.remove(temp_path)
        
    return ela_filename
