# MediBill AI

MediBill AI is a full-stack web application that helps users upload hospital bills, detect overcharging using government rate cards (CGHS & NPPA), and generate legal complaint reports.

## 🚀 Key Features

- **AI-Powered OCR**: Extract text from medical bills instantly.
- **Overcharge Detection**: Compare bill items with CGHS/NPPA benchmark data.
- **Legal Complaint Generation**: Generate formal letters under the Consumer Protection Act 2019 using Gemini AI.
- **PDF Analysis Reports**: Get a professional breakdown of your bill in PDF format.
- **Premium Dashboard**: A modern, responsive UI built with Next.js and Tailwind CSS.

## 📂 Project Structure

- `/frontend`: Next.js (App Router) application.
- `/backend`: FastAPI (Python) server.
- `/database`: SQL schema and seed data.

## ⚙️ Setup Instructions

### Backend
1. Go to `/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Set your environment variables (GEMINI_API_KEY, GOOGLE_APPLICATION_CREDENTIALS).
4. Run: `uvicorn main:app --reload`.

### Frontend
1. Go to the root folder.
2. Install dependencies: `npm install`.
3. Set your `NEXT_PUBLIC_API_URL`.
4. Run: `npm run dev`.

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS, shadcn/ui.
- **Backend**: FastAPI, SQLAlchemy, Pydantic.
- **AI/OCR**: Google Vision API, Gemini Pro API.
- **Database**: PostgreSQL.
- **PDF**: ReportLab.
