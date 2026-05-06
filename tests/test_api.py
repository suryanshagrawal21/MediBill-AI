import sys
import json
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

image_path = r"C:\Users\surya\.gemini\antigravity\brain\e9394aa3-f8bc-4220-8bc3-935b16596aed\media__1778096069402.png"

try:
    with open(image_path, "rb") as f:
        file_content = f.read()
except FileNotFoundError:
    print(f"Error: Image not found at {image_path}")
    sys.exit(1)

print("Sending POST request to /extract...")
response = client.post("/extract", files={"file": ("bill.png", file_content, "image/png")})

print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print("Success! Response JSON:")
    print(json.dumps(response.json(), indent=2))
else:
    print("Failed! Response details:")
    try:
        print(json.dumps(response.json(), indent=2))
    except Exception:
        print(response.text)
