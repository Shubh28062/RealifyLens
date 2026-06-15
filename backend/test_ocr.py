import easyocr
import sys
sys.stdout.reconfigure(encoding='utf-8')
print('Imported easyocr')
reader = easyocr.Reader(['en'], verbose=False)
print('Successfully loaded reader (and downloaded models if needed).')
