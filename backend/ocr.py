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
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest"
    ]

    prompt = """You are an advanced medical bill auditing AI integrated with a PostgreSQL database containing CGHS and NPPA medicine pricing data.

Your task is to:
1. Process OCR-extracted text from medical bills.
2. Clean and correct OCR errors intelligently.
3. Extract structured and validated data.
4. Match extracted medicines with database entries.
5. Compare prices and detect overpricing accurately.

----------------------------------------
STRICT RULES:

1. ACCURACY FIRST:
- Carefully analyze OCR text (it may be noisy or incorrect)
- Correct spelling using contextual understanding (e.g., "Paracetmol" -> "Paracetamol")

2. DATA EXTRACTION:
Extract:
- Patient Name
- Hospital/Pharmacy Name
- Date
- Medicines (name, quantity, unit price, total price)
- Total Bill Amount
- Contact Info (phone/email)

3. DATABASE MATCHING:
- Match medicine names with PostgreSQL database
- Use fuzzy matching logic if exact match fails
- Prefer generic names over brand names
- Return matched database record ID

4. PRICE VALIDATION:
- Fetch CGHS and NPPA prices from database
- Compare with extracted price
- Classify:
    - "Normal" (<= 10% variation)
    - "Slightly High" (10-30%)
    - "Overpriced" (> 30%)

5. ERROR HANDLING:
- If confidence is low, mark:
  "uncertain": true
- Do not hallucinate missing values

6. OUTPUT FORMAT (STRICT JSON):
{
  "patient_name": "",
  "hospital_name": "",
  "date": "",
  "medicines": [
    {
      "ocr_name": "",
      "matched_name": "",
      "database_id": "",
      "quantity": "",
      "extracted_price": "",
      "cghs_price": "",
      "nppa_price": "",
      "price_status": "",
      "confidence": ""
    }
  ],
  "total_amount": "",
  "contact": {
    "phone": "",
    "email": ""
  }
}

7. ROBUSTNESS:
- Handle broken lines, merged words, and OCR noise
- Extract maximum correct information even if formatting is poor

----------------------------------------

You are both:
- A medical billing auditor
- A data validation engine
- A fuzzy matching system

Return ONLY JSON without any markdown formatting.
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
                print(f"[Gemini] {model_name} error: {err_msg[:100]}")
                time.sleep(1) # brief pause
                break # break retry loop, move to next model candidate

    if last_error:
        raise RuntimeError(f"Gemini Extraction failed after trying all models: {last_error}")
    raise RuntimeError("Extraction failed: No models returned valid data.")


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
    """Smart fallback OCR using pytesseract with accuracy optimizations and regex heuristics."""
    # Handle paths automatically
    tess_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if not os.path.exists(tess_path):
        tess_path_86 = r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
        if os.path.exists(tess_path_86):
            tess_path = tess_path_86
    pytesseract.pytesseract.tesseract_cmd = tess_path
    
    try:
        # Prioritize accuracy: PSM 6 for a uniform block of text
        custom_config = r'--oem 3 --psm 6'

        if mime_type.startswith("image"):
            image = Image.open(io.BytesIO(file_bytes))
            # Enhance accuracy with grayscale
            image = image.convert('L')
            text = pytesseract.image_to_string(image, config=custom_config)
        elif mime_type == "application/pdf":
            try:
                from pdf2image import convert_from_bytes
                # Prioritize accuracy: 300 DPI limits noise
                pages = convert_from_bytes(file_bytes, dpi=300, first_page=1, last_page=1)
                image = pages[0].convert('L')
                text = pytesseract.image_to_string(image, config=custom_config)
            except Exception:
                text = ""
        else:
            text = ""
            
        # 1. Contact Info
        emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        phones = re.findall(r"\b\d{10}\b", text)

        # 2. Smart Patient/Hospital Extraction
        patient_name = "Unknown"
        hospital_name = "Unknown"
        bill_number = "Unknown"
        date = "Unknown"
        
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if len(lines) > 0:
            hospital_name = lines[0] # Usually the first line of the header
            
        name_match = re.search(r"(?i)(?:patient name|name|mr\.|mrs\.|ms\.|patient)[:\s-]+([A-Za-z\s]{3,30})", text)
        if name_match:
            patient_name = name_match.group(1).split('\n')[0].strip()
            
        date_match = re.search(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b", text)
        if date_match:
            date = date_match.group(0)
            
        bill_match = re.search(r"(?i)(?:bill no|invoice no|receipt no|id)[:.\s-]+([\w\d]+)", text)
        if bill_match:
            bill_number = bill_match.group(1).strip()

        # 3. Item Extraction with Categories
        items = []
        for line in lines:
            parts = line.split()
            if len(parts) >= 2:
                last_token = parts[-1].replace(',', '')
                # Extract trailing decimal price
                last_token = re.sub(r'[^\d.]', '', last_token)
                try:
                    price = float(last_token)
                    if 0 < price < 1000000:
                        name = " ".join(parts[:-1]).strip()
                        # Filter out garbage noise or totals
                        if len(name) > 3 and not re.search(r"(?i)total|amount|balance|due|paid|net", name):
                            # Analyze name to assign category intelligently
                            category = "Other"
                            if re.search(r"(?i)test|profile|scan|x-ray|mri|ct|usg|blood", name):
                                category = "Diagnostics"
                            elif re.search(r"(?i)tab|inj|syr|cap|iv|medicine|drop|saline", name):
                                category = "Pharmacy"
                            elif re.search(r"(?i)room|ward|icu|stay|bed", name):
                                category = "Room Charges"
                            elif re.search(r"(?i)consult|dr\.|doctor|visit|fee", name):
                                category = "Consultation"
                            elif re.search(r"(?i)surgery|operation|ot", name):
                                category = "Surgery"
                                
                            items.append({"name": name, "charged_price": price, "quantity": 1, "category": category})
                except ValueError:
                    continue

        return {
            "patient_name": patient_name,
            "hospital_name": hospital_name,
            "bill_number": bill_number,
            "date": date,
            "doctor_name": "Unknown",
            "ward": "Unknown",
            "total_amount": sum(i["charged_price"] for i in items),
            "tax": 0.0,
            "discount": 0.0,
            "items": items,
            "emails": emails,
            "phones": phones,
            "raw_text": text
        }
    except Exception as e:
        raise RuntimeError(f"Fallback OCR failed: {e}")
