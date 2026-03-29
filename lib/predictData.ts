// Predictive Bill Estimation — Mock Data & Logic
// Simulates a backend AI model that predicts expected hospital costs

export type RiskLevel = "low" | "moderate" | "high"

export interface PredictionResult {
  procedure: string
  hospital: string
  city: string
  minCost: number
  maxCost: number
  cghsBenchmark: number
  estimatedVariation: number // ±%
  risk: RiskLevel
  riskLabel: string
  category: string
  breakdown: { label: string; amount: number }[]
  note: string
}

export const HOSPITALS = [
  "AIIMS Delhi",
  "Fortis Hospital",
  "Apollo Hospitals",
  "Max Healthcare",
  "Medanta",
  "Government District Hospital",
  "Safdarjung Hospital",
  "Sir Ganga Ram Hospital",
]

export const PROCEDURES = [
  { value: "blood_test_cbc", label: "Blood Test – CBC", icon: "" },
  { value: "xray_chest", label: "X-Ray – Chest PA View", icon: "" },
  { value: "mri_brain", label: "MRI – Brain Scan", icon: "" },
  { value: "ct_abdomen", label: "CT Scan – Abdomen", icon: "" },
  { value: "ecg", label: "ECG – Electrocardiogram", icon: "️" },
  { value: "surgery_appendix", label: "Surgery – Appendectomy", icon: "" },
  { value: "surgery_knee", label: "Surgery – Knee Replacement", icon: "" },
  { value: "icu_stay", label: "ICU Stay (per day)", icon: "" },
  { value: "dialysis", label: "Dialysis Session", icon: "" },
  { value: "delivery_normal", label: "Normal Delivery", icon: "" },
  { value: "delivery_csec", label: "C-Section Delivery", icon: "" },
  { value: "angioplasty", label: "Angioplasty", icon: "" },
]

export const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
]

// Core prediction database
const PROCEDURE_DATA: Record<string, Omit<PredictionResult, "hospital" | "city" | "procedure">> = {
  blood_test_cbc: {
    minCost: 300, maxCost: 1800, cghsBenchmark: 450, estimatedVariation: 30,
    risk: "moderate", riskLabel: "Moderate Risk",
    category: "Diagnostics",
    breakdown: [
      { label: "Lab Processing", amount: 200 },
      { label: "Sample Collection", amount: 80 },
      { label: "Report Generation", amount: 170 },
    ],
    note: "CBC test costs vary significantly between private labs and government hospitals.",
  },
  xray_chest: {
    minCost: 200, maxCost: 1500, cghsBenchmark: 250, estimatedVariation: 30,
    risk: "moderate", riskLabel: "Moderate Risk",
    category: "Radiology",
    breakdown: [
      { label: "X-Ray Equipment Usage", amount: 120 },
      { label: "Radiologist Reading Fee", amount: 80 },
      { label: "Report Fees", amount: 50 },
    ],
    note: "Chest X-Ray is often overcharged at private hospitals by 3–5x government rates.",
  },
  mri_brain: {
    minCost: 4000, maxCost: 18000, cghsBenchmark: 6000, estimatedVariation: 45,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Radiology",
    breakdown: [
      { label: "MRI Machine Usage", amount: 3500 },
      { label: "Contrast Dye (if needed)", amount: 800 },
      { label: "Radiologist Reading", amount: 1200 },
      { label: "Report & CD", amount: 500 },
    ],
    note: "MRI charges vary enormously. Government hospitals charge 60–70% less than private chains.",
  },
  ct_abdomen: {
    minCost: 2500, maxCost: 10000, cghsBenchmark: 3500, estimatedVariation: 40,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Radiology",
    breakdown: [
      { label: "CT Scan Usage", amount: 2200 },
      { label: "Contrast Media", amount: 600 },
      { label: "Radiologist Fee", amount: 700 },
    ],
    note: "CT Abdomen with contrast is frequently overcharged at private hospitals.",
  },
  ecg: {
    minCost: 100, maxCost: 1100, cghsBenchmark: 200, estimatedVariation: 20,
    risk: "moderate", riskLabel: "Moderate Risk",
    category: "Cardiology",
    breakdown: [
      { label: "ECG Machine Usage", amount: 80 },
      { label: "Technician Fee", amount: 70 },
      { label: "Cardiologist Reading", amount: 50 },
    ],
    note: "Simple ECG is widely overcharged. CGHS benchmark is well below average private rate.",
  },
  surgery_appendix: {
    minCost: 25000, maxCost: 80000, cghsBenchmark: 22000, estimatedVariation: 55,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Surgery",
    breakdown: [
      { label: "Surgeon Fee", amount: 12000 },
      { label: "Anesthesiologist", amount: 6000 },
      { label: "OT Charges", amount: 8000 },
      { label: "Consumables", amount: 4000 },
      { label: "Hospital Stay (2d)", amount: 12000 },
    ],
    note: "Appendectomy costs are highly variable. Laparoscopic surgery may cost 20–30% more.",
  },
  surgery_knee: {
    minCost: 80000, maxCost: 350000, cghsBenchmark: 85000, estimatedVariation: 65,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Orthopaedics",
    breakdown: [
      { label: "Implant Cost", amount: 50000 },
      { label: "Surgeon Fee", amount: 30000 },
      { label: "OT Charges", amount: 20000 },
      { label: "Physiotherapy (3d)", amount: 9000 },
      { label: "Hospital Stay (5d)", amount: 30000 },
    ],
    note: "Implant brands significantly affect total cost. CGHS empanelled hospitals must follow fixed rates.",
  },
  icu_stay: {
    minCost: 8000, maxCost: 45000, cghsBenchmark: 11000, estimatedVariation: 48,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Critical Care",
    breakdown: [
      { label: "ICU Bed Charges", amount: 6000 },
      { label: "Nursing & Monitoring", amount: 3000 },
      { label: "Ventilator (if needed)", amount: 2000 },
    ],
    note: "ICU charges are the most commonly inflated items in Indian hospital bills.",
  },
  dialysis: {
    minCost: 600, maxCost: 3500, cghsBenchmark: 1000, estimatedVariation: 35,
    risk: "moderate", riskLabel: "Moderate Risk",
    category: "Nephrology",
    breakdown: [
      { label: "Machine Usage", amount: 500 },
      { label: "Medications / Saline", amount: 300 },
      { label: "Nursing Fee", amount: 200 },
    ],
    note: "Dialysis is needed repeatedly; even small per-session overcharges accumulate rapidly.",
  },
  delivery_normal: {
    minCost: 8000, maxCost: 60000, cghsBenchmark: 9000, estimatedVariation: 50,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Maternity",
    breakdown: [
      { label: "Delivery Charges", amount: 5000 },
      { label: "Gynaecologist Fee", amount: 3000 },
      { label: "Room Rent (2d)", amount: 6000 },
      { label: "Newborn Care", amount: 2000 },
    ],
    note: "Private hospitals charge 5–8x more than government facilities for normal delivery.",
  },
  delivery_csec: {
    minCost: 40000, maxCost: 180000, cghsBenchmark: 25000, estimatedVariation: 60,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Maternity",
    breakdown: [
      { label: "Surgery & OT Charges", amount: 15000 },
      { label: "Gynaecologist Fee", amount: 8000 },
      { label: "Anesthesiologist", amount: 5000 },
      { label: "Hospital Stay (4d)", amount: 20000 },
      { label: "Newborn / NICU", amount: 5000 },
    ],
    note: "C-sections are significantly more expensive and are frequently up-sold by private hospitals.",
  },
  angioplasty: {
    minCost: 90000, maxCost: 400000, cghsBenchmark: 95000, estimatedVariation: 65,
    risk: "high", riskLabel: "High Overcharge Risk",
    category: "Cardiology",
    breakdown: [
      { label: "Stent Cost (DES)", amount: 50000 },
      { label: "Cardiologist Fee", amount: 25000 },
      { label: "Cath-Lab Charges", amount: 20000 },
      { label: "Hospital Stay (3d)", amount: 30000 },
    ],
    note: "Stent pricing is regulated but procedural charges vary. Compare costs across hospitals.",
  },
}

// City multiplier (simulates cost-of-living adjustments)
const CITY_MULTIPLIERS: Record<string, number> = {
  "Delhi": 1.15, "Mumbai": 1.25, "Bangalore": 1.20, "Chennai": 1.10,
  "Hyderabad": 1.05, "Pune": 1.10, "Kolkata": 0.95, "Ahmedabad": 0.90,
  "Jaipur": 0.85, "Lucknow": 0.80,
}

// Hospital tier multiplier
const HOSPITAL_MULTIPLIERS: Record<string, number> = {
  "AIIMS Delhi": 0.60,
  "Safdarjung Hospital": 0.55,
  "Government District Hospital": 0.45,
  "Apollo Hospitals": 1.30,
  "Fortis Hospital": 1.20,
  "Max Healthcare": 1.25,
  "Medanta": 1.35,
  "Sir Ganga Ram Hospital": 1.10,
}

export function getPrediction(
  procedureValue: string,
  hospital: string,
  city: string
): PredictionResult | null {
  const base = PROCEDURE_DATA[procedureValue]
  if (!base) return null

  const cityMult = CITY_MULTIPLIERS[city] ?? 1.0
  const hospMult = HOSPITAL_MULTIPLIERS[hospital] ?? 1.0

  const mult = (cityMult + hospMult) / 2

  return {
    ...base,
    procedure: PROCEDURES.find(p => p.value === procedureValue)?.label ?? procedureValue,
    hospital,
    city,
    minCost: Math.round(base.minCost * mult),
    maxCost: Math.round(base.maxCost * mult),
    cghsBenchmark: base.cghsBenchmark,
  }
}

export function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

export const RISK_CONFIG = {
  low:      { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-300", border: "border-green-300 dark:border-green-800", dot: "bg-green-500", label: "Normal Pricing" },
  moderate: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-300 dark:border-yellow-800", dot: "bg-yellow-500", label: "Moderate Risk" },
  high:     { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-300 dark:border-red-900", dot: "bg-red-500", label: "High Overcharge Risk" },
}
