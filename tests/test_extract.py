import requests
import json
import pprint

image_path = r"C:\Users\surya\.gemini\antigravity\brain\8e2d49b6-4ac5-4383-9181-93fbb30318cb\media__1778101675384.png"
url = "http://127.0.0.1:8000/extract"

with open(image_path, "rb") as f:
    files = {"file": ("bill.png", f, "image/png")}
    response = requests.post(url, files=files)

print("Status Code:", response.status_code)
try:
    data = response.json()
    with open("output.json", "w") as out_f:
        json.dump(data, out_f, indent=2)
    print("Saved to output.json")
except Exception as e:
    print("Failed to decode JSON:", e)
    print(response.text)
