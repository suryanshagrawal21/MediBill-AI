import os
from google import genai

# Fetch the API key strictly from the environment variables
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    raise ValueError("Error: GEMINI_API_KEY environment variable not found. Please set it before running the script.")

# Initialize the client securely
client = genai.Client(api_key=api_key)

print("Available models:")
for model in client.models.list():
    # Corrected the action check to filter for text/multimodal generation capabilities
    if "generateContent" in model.supported_actions:
        print(model.name)
