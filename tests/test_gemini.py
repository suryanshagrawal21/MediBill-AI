import sys
from backend.ocr import extract_bill_data_with_gemini

image_path = r"C:\Users\surya\.gemini\antigravity\brain\e9394aa3-f8bc-4220-8bc3-935b16596aed\media__1778096069402.png"

try:
    with open(image_path, "rb") as f:
        file_content = f.read()
except FileNotFoundError:
    print(f"Error: Image not found at {image_path}")
    sys.exit(1)

print("Running Gemini Vision extraction...")
try:
    data = extract_bill_data_with_gemini(file_content, "image/png")
    print("Success!")
    print(data)
except Exception as e:
    print(f"Gemini failed with error: {e}")
