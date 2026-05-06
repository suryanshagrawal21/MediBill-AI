from google import genai
import os

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "AIzaSyBL0YTgR9pfxiwqOT0BdAkqHCTKMUCPfN4"))

print("Available models:")
for model in client.models.list():
    if "generateContent" in model.supported_actions and "vision" in getattr(model, "supported_generation_methods", "vision"):
        print(model.name)
    else:
        print(f"Generic: {model.name}")
