# MediBill AI – Medical Bill Negotiator

MediBill AI is a full-stack web application that helps users upload hospital bills, detect overcharging using government rate cards (CGHS & NPPA), and generate legal complaint reports.

---

##  Full Project Explanation (Presentation Ready)

###  Overview (The Big Picture)
**"MediBill AI is an end-to-end system that analyzes hospital bills to detect overcharges and automatically generates legal complaint notices based on government-mandated price benchmarks."**

###  Technical Pipeline

** Step 1: Bill Upload**
The user uploads their hospital bill in either image (JPG/PNG) or PDF format through a streamlined, premium interface.
 **Technology:** Next.js Frontend with Framer Motion animations.

** Step 2: OCR (Text Extraction)**
The system utilizes an OCR engine to extract raw text data from the uploaded bill, identifying items such as medicine names, diagnostic tests, and charged prices.
 **Example:** Paracetamol – ₹85 | ICU Charges – ₹18,000
 **Technology:** Gemini Vision / Tesseract OCR (with fallback).

** Step 3: Data Structuring (AI/NLP)**
Raw OCR text is often fragmented. The system uses AI to clean and structure this data into a standardized format.
 **Example:** "PCM 500" → "Paracetamol 500mg"
 **Technology:** Google Gemini Pro API for intelligent entity mapping.

** Step 4: Government Policy Benchmarking**
The system compares each extracted item against official government datasets: CGHS (Central Government Health Scheme) for treatments and NPPA (National Pharmaceutical Pricing Authority) for medicines.

** Step 5: Precision Audit Calculations**
The backend performs accurate price comparisons to identify discrepancies.
 **Formula:** `Overcharge = Charged Price – Benchmark Price` | `Percentage = (Overcharge / Benchmark) × 100`
 **Example:** Charged: ₹85 | Benchmark: ₹2 | Difference: ₹83 (4150% Overcharge )

** Step 6: Overcharge Detection**
If a price exceeds the legal threshold, the system flags the item, calculates the total excess amount, and visualizes the data via interactive charts.

** Step 7: Legal Notice Generation**
Finally, the system generates a professionally drafted legal complaint. This document includes patient metadata, itemized overcharges, government rate comparisons, and citations of relevant Consumer Protection regulations.
 **Technology:** Dynamic HTML-to-PDF generation.

###  Summary Flow
 **Upload → OCR → Data Structuring → Benchmark Matching → Audit Calculation → Legal Notice Generation**

---

## ️ Technologies Used
- **Frontend**: Next.js 14, Tailwind CSS (v4), Framer Motion, Lucide React.
- **Backend**: Python, FastAPI.
- **AI/ML**: Google Gemini Pro (Audit & Extraction), Gemini Vision (OCR).
- **OCR Fallback**: Pytesseract, Pillow.
- **Data**: CGHS & NPPA Price Benchmarks.

##  Accuracy & Reliability
Our system maintains high precision through a multi-tier validation process:
1.  **Extraction Integrity**: Advanced OCR combined with AI verification.
2.  **Entity Matching**: Fuzzy matching algorithms to correctly identify medical items.
3.  **Calculation Precision**: Strict mathematical logic to prevent rounding errors or approximations.

 **"We transform complex hospital bills into legally actionable insights using AI and regulatory data."**
