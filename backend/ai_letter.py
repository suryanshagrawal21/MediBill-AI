import os
import requests
from . import schemas
from dotenv import load_dotenv
import pathlib

# Load .env from the backend directory
load_dotenv(pathlib.Path(__file__).parent / ".env")

def generate_legal_letter(analysis: schemas.BillAnalysis):
    """
    Generates a legal complaint letter using Gemini REST API.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "your_gemini_api_key_here":
        return "GEMINI_API_KEY NOT CONFIGURED"
    
    api_key = api_key.strip()

    overcharged_items = [item for item in analysis.items if item.is_overcharged]
    item_details = "\n".join([
        f"- {item.item_name}: Charged ₹{item.charged_price}, CGHS Benchmark ₹{item.benchmark_price}, Excess Charged ₹{item.difference}"
        for item in overcharged_items
    ])

    prompt = f"""Generate a formal legal complaint letter to a hospital for medical overbilling under the Consumer Protection Act, 2019.

Details:
Total Bill Amount: ₹{analysis.total_bill}
Total Overcharged Amount to be Refunded: ₹{analysis.total_overcharge}

Item-wise violations:
{item_details}

The letter should be professional, cite Section 2(9) and Section 39 of the Consumer Protection Act 2019, reference CGHS/NPPA benchmark rates, and demand a refund within 15 days or legal action will be initiated."""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"[Gemini Error] {e}")
        raise Exception(f"Gemini API error: {str(e)}")
