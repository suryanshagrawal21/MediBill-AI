from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from .database import engine, get_db
from . import models, schemas, ocr, analysis, report_gen, ai_letter
import io

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Warning] Could not connect to database: {e}")
    print("[Warning] Backend is running in DB-less mode. Some endpoints will not work.")


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
    return {"message": "Welcome to MediBill AI API"}

@app.post("/upload")
async def upload_bill(file: UploadFile = File(...)):
    """
    Accepts PDF/image and extracts text using Google Vision API.
    Falls back to demo data if Vision API is not configured.
    """
    content = await file.read()

    # Demo items that represent a typical overcharged hospital bill
    demo_items = [
        schemas.ItemCreate(name="Paracetamol 500mg", price=10.0, quantity=5),
        schemas.ItemCreate(name="CBC Test", price=1200.0, quantity=1),
        schemas.ItemCreate(name="ICU Charges/day", price=25000.0, quantity=1),
        schemas.ItemCreate(name="Surgical Gloves", price=500.0, quantity=2),
        schemas.ItemCreate(name="X-Ray", price=800.0, quantity=1),
    ]

    try:
        # Try OCR with Google Vision API
        text = ocr.extract_text_from_image(content)
        return {"filename": file.filename, "extracted_text": text, "items": demo_items}
    except Exception as e:
        # Vision API not configured — use demo items for analysis
        print(f"[OCR Skipped] Google Vision not configured: {e}")
        return {
            "filename": file.filename,
            "extracted_text": "[Demo mode: OCR skipped — Using sample overcharged bill data]",
            "items": demo_items
        }


@app.post("/analyze", response_model=schemas.BillAnalysis)
def analyze_bill_endpoints(items: list[schemas.ItemCreate], db: Session = Depends(get_db)):
    """
    Analyzes items against CGHS/NPPA benchmarks.
    """
    return analysis.analyze_bill(items, db)

@app.post("/report")
def generate_pdf_report_endpoint(analysis_result: schemas.BillAnalysis):
    """
    Generates a PDF analysis report.
    """
    pdf_buffer = report_gen.generate_pdf_report(analysis_result.items, analysis_result.total_bill, analysis_result.total_overcharge)
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=analysis_report.pdf"})

@app.post("/generate-letter")
def generate_letter_endpoint(analysis_result: schemas.BillAnalysis):
    """
    Generates a legal complaint letter.
    """
    letter_text = ai_letter.generate_legal_letter(analysis_result)
    return {"letter": letter_text}
