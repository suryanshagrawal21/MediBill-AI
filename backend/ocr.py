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


# ── Extraction prompt shared across models ──
_EXTRACTION_PROMPT = """You are an expert medical bill auditor AI. Your job is to carefully read a hospital/medical bill image and extract ALL information from it accurately.

CRITICAL INSTRUCTIONS:
- Extract EVERY line item from the bill — medicines, diagnostics, room charges, doctor fees, nursing, procedures, consumables, ambulance, etc.
- Do NOT skip any charge, even if the text is blurry or partially visible. Make your best interpretation.
- Fix OCR errors using medical knowledge (e.g., "Paracetmol" -> "Paracetamol", "X-Ray Chst" -> "Chest X-Ray").
- For prices, strip currency symbols (₹, Rs, INR) and extract the numeric value only.
- If a field is truly not present in the bill, use null — do NOT fabricate data.

ITEM CATEGORIES to use:
- "Pharmacy" — medicines, tablets, injections, IV fluids, syrups, drops
- "Diagnostics" — blood tests, urine tests, MRI, CT scan, X-ray, ultrasound, ECG, culture
- "Room Charges" — room rent, ward charges, ICU charges, bed charges
- "Consultation" — doctor consultation fee, specialist visit, surgeon fee, anesthesiologist
- "Nursing" — nursing charges, nursing fee
- "Procedures" — surgery, operation, dialysis, physiotherapy, dressing, suturing, nebulization
- "Consumables" — gloves, syringes, cannula, bandages, masks
- "Other" — ambulance, oxygen, ventilator, any unclassified charge

OUTPUT FORMAT — Return ONLY this exact JSON structure, no markdown, no extra text:
{
  "patient_name": "string or null",
  "hospital_name": "string or null",
  "bill_number": "string or null",
  "date": "string or null",
  "doctor_name": "string or null",
  "ward": "string or null",
  "total_amount": number or null,
  "contact": {
    "phone": "string or null",
    "email": "string or null"
  },
  "items": [
    {
      "name": "Clean, corrected item name",
      "ocr_name": "Raw name as seen on bill",
      "category": "one of the categories above",
      "quantity": number,
      "charged_price": number,
      "expected_price": number or null,
      "cghs_price": number or null,
      "nppa_price": number or null,
      "price_status": "Normal | Slightly High | Overpriced | Unknown"
    }
  ]
}

IMPORTANT NOTES:
- "charged_price" is the unit price (per item/per day), NOT the total for that line.
- "quantity" is how many units/days were charged. If not specified, use 1.
- "expected_price" should be the CGHS or NPPA government benchmark price if you know it. Otherwise use null.
- Extract ALL items — a typical hospital bill has 5-30 line items. Do not stop at just medicines.
- If the bill has a table format (description | qty | rate | amount), extract each row as a separate item.

Return ONLY the JSON object. No explanation, no markdown code blocks.
"""


def extract_bill_data_with_gemini(file_bytes: bytes, mime_type: str) -> dict:
    """
    Structured medical bill extraction using the new google-genai SDK.
    Tries gemini-2.5-flash (fastest), then gemini-flash-latest as fallback.
    """
    import time
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=_get_gemini_key())

    MODEL_CANDIDATES = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
    ]

    b64_data = base64.b64encode(file_bytes).decode("utf-8")
    last_error = None

    for model_name in MODEL_CANDIDATES:
        print(f"[Gemini] Trying {model_name}...")

        for attempt in range(4):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Content(
                            role="user",
                            parts=[
                                types.Part.from_text(text=_EXTRACTION_PROMPT),
                                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                            ],
                        )
                    ],
                )

                if not response or not response.text:
                    print(f"[Gemini] {model_name} returned empty response, trying next...")
                    break

                raw = response.text.strip()
                # Strip markdown code fences if present
                raw = re.sub(r"^```(?:json)?\s*", "", raw)
                raw = re.sub(r"\s*```$", "", raw)
                parsed = json.loads(raw)
                print(f"[Gemini] Successfully extracted data with {model_name}")
                return parsed

            except json.JSONDecodeError as e:
                last_error = e
                print(f"[Gemini] {model_name} returned invalid JSON: {str(e)[:80]}")
                break  # try next model

            except Exception as e:
                last_error = e
                err_msg = str(e).lower()
                print(f"[Gemini] {model_name} attempt {attempt+1} error: {err_msg[:120]}")

                if "rate" in err_msg or "quota" in err_msg or "429" in err_msg or "503" in err_msg or "unavailable" in err_msg:
                    import time
                    time.sleep(3)
                    continue  # retry same model
                break  # try next model

    if last_error:
        raise RuntimeError(f"Gemini extraction failed after trying all models: {last_error}")
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
                    # Require that the price has a decimal point if it's very large, or it's a typical price format
                    if '.' in parts[-1] or ',' in parts[-1]:
                        price = float(last_token)
                    else:
                        # If it's a whole number, it might be a zip code if it's very large
                        price = float(last_token)
                        if price > 50000:
                            continue

                    if 0 < price < 1000000:
                        name = " ".join(parts[:-1]).strip()
                        # Filter out garbage noise, totals, or obvious non-items
                        if len(name) > 3 and not re.search(r"(?i)total|amount|balance|due|paid|net|telangana|hyderabad|colony|road|ph:|phone", name):
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
