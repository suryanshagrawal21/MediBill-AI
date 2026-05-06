import sys
from backend.ocr import extract_bill_data_with_gemini

image_path = r"C:\Users\surya\.gemini\antigravity\brain\e9394aa3-f8bc-4220-8bc3-935b16596aed\media__1778096069402.png"

try:
    with open(image_path, "rb") as f:
        file_content = f.read()
except FileNotFoundError:
    print(f"Error: Image not found at {image_path}")
    sys.exit(1)

from google import genai
from google.genai import types
import os

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "AIzaSyBL0YTgR9pfxiwqOT0BdAkqHCTKMUCPfN4"))

models_to_test = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash-lite",
    "gemini-3.1-flash-lite-preview"
]

for model_name in models_to_test:
    print(f"\nTrying {model_name}...")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text="Extract patient name from this bill. Respond only with JSON `{\"patient_name\": \"...\"}`"),
                        types.Part.from_bytes(data=file_content, mime_type="image/png"),
                    ],
                )
            ],
        )
        print(f"Success with {model_name}:")
        print(response.text)
        break
    except Exception as e:
        print(f"Failed with {model_name}: {e}")

