import os
from google.cloud import vision
import io

def extract_text_from_image(image_content):
    """
    Extracts text from an image using Google Cloud Vision API.
    """
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_content)
    response = client.text_detection(image=image)
    texts = response.text_annotations
    
    if response.error.message:
        raise Exception(f"{response.error.message}")

    return texts[0].description if texts else ""

def parse_bill_text(text):
    """
    Uses heuristics (or could be enhanced with Gemini) to parse text into structured JSON.
    Simplified version for now.
    """
    lines = text.split('\n')
    items = []
    # Simple regex or split-based parsing could go here
    # For now, we'll suggest using Gemini for more robust parsing
    return items
