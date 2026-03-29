from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from .database import engine, get_db
from . import models, schemas, ocr, analysis, report_gen, ai_letter
import io
import json

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Warning] Could not connect to database: {e}")
    print("[Warning] Backend is running in DB-less mode.")


app = FastAPI(title="MediBill AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "MediBill AI API — Ready"}


# ─────────────────────────────────────────────────────────────────
# /extract  — Real AI-powered bill extraction via Gemini Vision
# Returns structured patient info + line items as JSON
# ─────────────────────────────────────────────────────────────────

# CGHS benchmark lookup (item name → benchmark price in ₹)
BENCHMARK_MAP = {
    # Diagnostics
    "cbc": 450, "cbc blood test": 450, "complete blood count": 450,
    "blood test": 400, "blood glucose": 200, "blood sugar": 200,
    "urine routine": 150, "urine analysis": 150,
    "thyroid": 400, "tsh": 350, "t3 t4": 300,
    "hba1c": 500, "lipid profile": 400,
    "liver function": 600, "lft": 600,
    "kidney function": 600, "kft": 600, "creatinine": 200,
    "culture sensitivity": 800,
    "dengue": 400, "malaria": 300, "typhoid": 350,
    # Radiology
    "x-ray": 250, "xray": 250, "chest x-ray": 250, "chest pa": 250,
    "mri": 6000, "mri brain": 6000, "mri spine": 7000, "mri knee": 5000,
    "ct scan": 3500, "ct abdomen": 3500, "ct chest": 4000, "ct brain": 3000,
    "ultrasound": 600, "usg": 600, "sonography": 600,
    "ecg": 200, "electrocardiogram": 200, "echocardiography": 2200,
    # Pharmacy
    "paracetamol": 10, "paracetamol 500mg": 10,
    "paracetamol iv": 120, "paracetamol injection": 120,
    "amoxicillin": 25, "azithromycin": 35, "cefixime": 40,
    "ceftriaxone injection": 180, "ceftriaxone": 180,
    "pantoprazole": 15, "omeprazole": 12,
    "ondansetron": 18, "metronidazole": 12,
    "saline": 80, "normal saline": 80, "ringer lactate": 90,
    "dextrose": 85, "glucose iv": 85,
    "insulin": 180,
    # Consultation
    "doctor consultation": 800, "consultation fee": 800,
    "specialist consultation": 1200, "senior consultant": 1500,
    "surgeon fee": 12000, "anesthesiologist": 6000,
    # Room & Stay
    "room rent": 1500, "general ward": 800, "semi-private": 1500,
    "private room": 3000, "room charges": 1500,
    "bed charges": 1200,
    # ICU
    "icu charges": 11000, "icu": 11000, "iccu": 13000,
    "icu monitoring": 11000,
    # Nursing
    "nursing charges": 1500, "nursing fee": 1500,
    # Equipment / Consumables
    "oxygen": 2000, "oxygen cylinder": 2000, "oxygen charges": 2000,
    "ventilator": 6000,
    "surgical gloves": 150, "gloves": 150,
    "syringe": 8, "iv cannula": 30,
    "dressing": 200, "suture": 250,
    "nebulization": 300,
    # Transport
    "ambulance": 1500, "ambulance charges": 1500,
    # Procedures
    "dialysis": 1000, "physiotherapy": 500,
    "blood transfusion": 1500,
}

def get_benchmark(item_name: str) -> float | None:
    """Fuzzy lookup of CGHS benchmark based on item name."""
    name_lower = item_name.lower().strip()
    # Exact match first
    if name_lower in BENCHMARK_MAP:
        return BENCHMARK_MAP[name_lower]
    # Substring match
    for key, val in BENCHMARK_MAP.items():
        if key in name_lower or name_lower in key:
            return val
    return None


@app.post("/extract")
async def extract_bill(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Accept a hospital bill image or PDF.
    Use Gemini Vision to extract patient info + every line item.
    Cross-reference with CGHS benchmarks to flag overcharges.
    
    Returns a full structured analysis ready for the frontend.
    """
    content = await file.read()
    mime_type = ocr.guess_mime_type(file.filename or "bill.jpg", content)

    # ── Step 1: Extract raw data from bill using Gemini Vision ──
    try:
        bill_data = ocr.extract_bill_data_with_gemini(content, mime_type)
    except Exception as e:
        print(f"[Gemini Error] {e}. Falling back to basic OCR...")
        try:
            bill_data = ocr.fallback_ocr(content, mime_type)
        except Exception as fallback_err:
            raise HTTPException(status_code=500, detail=f"Both Gemini and fallback OCR failed: {fallback_err}")

    # Validation of required fields
    required_keys = {"patient_name", "hospital_name", "bill_number", "date", "doctor_name", "ward", "items"}
    for key in required_keys:
        if key not in bill_data:
            bill_data[key] = "Unknown" if key != "items" else []

    items = bill_data.get("items", [])
    patient_name = bill_data.get("patient_name", "Unknown")
    hospital_name = bill_data.get("hospital_name", "Unknown")

    if not items and patient_name == "Unknown" and hospital_name == "Unknown":
        raise HTTPException(status_code=400, detail="Could not read the bill. Please upload a correct bill.")

    # ── Step 2: Enrich with CGHS benchmarks ──
    items = bill_data.get("items", [])
    enriched_items = []
    total_charged = 0.0
    total_benchmark = 0.0
    total_overcharge = 0.0

    for idx, item in enumerate(items):
        charged = float(item.get("charged_price", 0))
        qty = int(item.get("quantity", 1))
        name = item.get("name", "Unknown Item")
        category = item.get("category", "Other")

        benchmark = get_benchmark(name)
        # If no benchmark found, use 60% of charged as a conservative estimate
        benchmark_price = benchmark if benchmark is not None else round(charged * 0.6, 2)

        line_charged = charged * qty
        line_benchmark = benchmark_price * qty
        overcharge = max(0.0, line_charged - line_benchmark)
        is_overcharged = line_charged > line_benchmark * 1.15  # 15% tolerance

        total_charged += line_charged
        total_benchmark += line_benchmark
        total_overcharge += overcharge

        enriched_items.append({
            "id": idx + 1,
            "item": name,
            "category": category,
            "charged": line_charged,
            "benchmark": line_benchmark,
            "overcharge": round(overcharge, 2),
            "quantity": qty,
            "unit_price": charged,
            "is_overcharged": is_overcharged,
            "benchmark_source": "CGHS" if benchmark is not None else "Estimated (60% of charged)",
        })

    overcharge_percentage = round((total_overcharge / total_charged * 100), 1) if total_charged > 0 else 0.0

    overcharge_percentage = round((total_overcharge / total_charged * 100), 1) if total_charged > 0 else 0.0

    # ── Step 3: Save to Database in Background ──
    def save_to_db():
        try:
            db_bill = models.Bill(filename=file.filename)
            db.add(db_bill)
            db.commit()
            db.refresh(db_bill)

            for e_item in enriched_items:
                db_item = models.Item(
                    bill_id=db_bill.id,
                    name=e_item["item"],
                    price=float(e_item["charged"]),
                    quantity=int(e_item["quantity"])
                )
                db.add(db_item)
            db.commit()
            print(f"[DB Success] Saved bill '{file.filename}' to background database.")
        except Exception as e:
            print(f"[DB Error] Could not save in background: {str(e)}")
            db.rollback()

    background_tasks.add_task(save_to_db)

    return {
        "source": "gemini_vision",
        "file": file.filename,
        "patient": {
            "patient_name": bill_data.get("patient_name", "Unknown"),
            "hospital_name": bill_data.get("hospital_name", "Unknown"),
            "bill_number": bill_data.get("bill_number", "Unknown"),
            "date": bill_data.get("date", "Unknown"),
            "doctor_name": bill_data.get("doctor_name", "Unknown"),
            "ward": bill_data.get("ward", "Unknown"),
        },
        "items": enriched_items,
        "total_charged": round(total_charged, 2),
        "total_benchmark": round(total_benchmark, 2),
        "total_overcharge": round(total_overcharge, 2),
        "overcharge_percentage": overcharge_percentage,
        "status": "overcharged" if overcharge_percentage > 5 else "fair",
    }


# ─────────────────────────────────────────────────────────────────
# Legacy endpoints (kept for compatibility)
# ─────────────────────────────────────────────────────────────────

@app.post("/upload")
async def upload_bill(file: UploadFile = File(...)):
    """Legacy endpoint — use /extract for full structured analysis."""
    content = await file.read()
    mime_type = ocr.guess_mime_type(file.filename or "bill.jpg", content)
    try:
        bill_data = ocr.extract_bill_data_with_gemini(content, mime_type)
        items = bill_data.get("items", [])
        legacy_items = [
            schemas.ItemCreate(name=i.get("name", "Item"), price=float(i.get("charged_price", 0)), quantity=int(i.get("quantity", 1)))
            for i in items
        ]
        return {"filename": file.filename, "extracted_text": f"Extracted {len(items)} items", "items": legacy_items}
    except Exception as e:
        print(f"[Upload Legacy] Error: {e}")
        demo = [
            schemas.ItemCreate(name="CBC Blood Test", price=1200.0, quantity=1),
            schemas.ItemCreate(name="ICU Charges/day", price=25000.0, quantity=1),
        ]
        return {"filename": file.filename, "extracted_text": "[Demo mode]", "items": demo}


@app.post("/analyze", response_model=schemas.BillAnalysis)
def analyze_bill_endpoint(items: list[schemas.ItemCreate], db: Session = Depends(get_db)):
    return analysis.analyze_bill(items, db)


@app.post("/report")
def generate_pdf_report_endpoint(analysis_result: schemas.BillAnalysis):
    pdf_buffer = report_gen.generate_pdf_report(
        analysis_result.items, analysis_result.total_bill, analysis_result.total_overcharge
    )
    return StreamingResponse(
        pdf_buffer, media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=analysis_report.pdf"}
    )


@app.post("/generate-letter")
def generate_letter_endpoint(analysis_result: schemas.BillAnalysis):
    letter_text = ai_letter.generate_legal_letter(analysis_result)
    return {"letter": letter_text}
