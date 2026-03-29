import os
import base64
import json
import re
import pathlib
import pytesseract
from PIL import Image
from dotenv import load_dotenv
import io

# Load .env from the backend directory
load_dotenv(pathlib.Path(__file__).parent / ".env")


def _get_gemini_key():
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key or key == "your_gemini_api_key_here":
        raise EnvironmentError("GEMINI_API_KEY is not set in backend/.env")
    return key


def extract_bill_data_with_gemini(file_bytes: bytes, mime_type: str) -> dict:
    """
    Structured medical bill extraction with high-speed fallback.
    """
    import time
    import google.generativeai as genai

    genai.configure(api_key=_get_gemini_key())

    MODEL_CANDIDATES = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
    ]

    prompt = """Extract medical bill data into JSON with the following fields:
{
  "patient_name": "Name",
  "hospital_name": "Hospital",
  "bill_number": "ID",
  "date": "DD-MM-YYYY",
  "doctor_name": "Doctor",
  "ward": "Ward type",
  "total_amount": 0.0,
  "tax": 0.0,
  "discount": 0.0,
  "items": [{
    "name": "Item",
    "charged_price": 0.0,
    "quantity": 1,
    "category": "Diagnostics|Pharmacy|Surgery|Consultation|Room|ICU|Nursing|Radiology|Consumables|Transport|Other"
  }]
}
Return ONLY JSON without any markdown formatting."
"""

    b64_data = base64.b64encode(file_bytes).decode("utf-8")
    inline_data = {"inline_data": {"mime_type": mime_type, "data": b64_data}}
    last_error = None

    for i, model_name in enumerate(MODEL_CANDIDATES):
        print(f"[Gemini] Trying {model_name}...")
        model = genai.GenerativeModel(model_name)
        
        # Reduced retries for speed; prefer switching models over waiting
        for attempt in range(3): 
            try:
                response = model.generate_content([prompt, inline_data])
                if not response or not hasattr(response, 'text') or not response.text:
                    break # try next model

                raw = response.text.strip()
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)
                return json.loads(raw)

            except Exception as e:
                last_error = e
                err_msg = str(e).lower()
                print(f"[Gemini] {model_name} error: {err_msg[:50]}")
                
                # If rate limited, switch model immediately unless it's the first attempt on the first model
                if "429" in err_msg or "quota" in err_msg:
                    if i == 0 and attempt == 0:
                        time.sleep(2) # very brief pause for the fastest model
                        continue
                    break # immediately try the next model candidate
                raise

    raise RuntimeError(f"Extraction failed: {last_error}")


def guess_mime_type(filename: str, content: bytes) -> str:
    """
    Determine mime type from extension or magic bytes.
    Gemini Vision supports: image/jpeg, image/png, image/webp, image/heic, application/pdf
    """
    name = filename.lower()
    if name.endswith(".pdf"):
        return "application/pdf"
    if name.endswith(".png"):
        return "image/png"
    if name.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if name.endswith(".webp"):
        return "image/webp"
    if name.endswith(".heic"):
        return "image/heic"

    # Magic byte fallback
    if content[:4] == b"%PDF":
        return "application/pdf"
    if content[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if content[:2] in (b"\xff\xd8", b"\xff\xe0", b"\xff\xe1"):
        return "image/jpeg"

    return "image/jpeg"  # safe default for most phone photos


def fallback_ocr(file_bytes: bytes, mime_type: str) -> dict:
    """Simple fallback OCR using pytesseract when Gemini fails.
    Returns a minimal JSON structure with empty patient info and items list.
    """
    try:
        if mime_type.startswith("image"):
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image)
        elif mime_type == "application/pdf":
            # For PDF, attempt to convert first page to image using pdf2image if available
            try:
                from pdf2image import convert_from_bytes
                pages = convert_from_bytes(file_bytes, first_page=1, last_page=1)
                image = pages[0]
                text = pytesseract.image_to_string(image)
            except Exception:
                text = ""
        else:
            text = ""
        # Very naive parsing: split lines, look for price patterns
        items = []
        for line in text.splitlines():
            parts = line.split()
            if len(parts) >= 2:
                # Assume last token is price
                try:
                    price = float(parts[-1].replace(",", ""))
                    name = " ".join(parts[:-1])
                    items.append({"name": name, "charged_price": price, "quantity": 1, "category": "Other"})
                except ValueError:
                    continue
        return {
            "patient_name": "",
            "hospital_name": "",
            "bill_number": "",
            "date": "",
            "doctor_name": "",
            "ward": "",
            "total_amount": 0,
            "tax": 0,
            "discount": 0,
            "items": items,
        }
    except Exception as e:
        raise RuntimeError(f"Fallback OCR failed: {e}")
