// Mock data for demonstration / hackathon mode
// Simulates what the backend OCR + AI analysis would return

export interface BillItem {
  id: number
  item: string
  charged: number
  benchmark: number
  overcharge: number
  category: string
}

export interface PatientInfo {
  patient_name: string
  hospital_name: string
  bill_number: string
  date: string
  doctor_name: string
  ward: string
}

export interface AnalysisResult {
  patient: PatientInfo
  items: BillItem[]
  total_charged: number
  total_benchmark: number
  total_overcharge: number
  overcharge_percentage: number
  status: "overcharged" | "fair"
}

export const MOCK_PATIENT: PatientInfo = {
  patient_name: "Rahul Sharma",
  hospital_name: "Fortis Hospital, Gurgaon",
  bill_number: "BILL-2026-94821",
  date: "12-03-2026",
  doctor_name: "Dr. Anjali Mehta",
  ward: "Semi-Private Room, Ward 4B",
}

export const MOCK_ITEMS: BillItem[] = [
  { id: 1, item: "CBC Blood Test", charged: 1500, benchmark: 450, overcharge: 1050, category: "Diagnostics" },
  { id: 2, item: "X-Ray Chest PA View", charged: 1200, benchmark: 250, overcharge: 950, category: "Radiology" },
  { id: 3, item: "Paracetamol IV (500mg)", charged: 800, benchmark: 120, overcharge: 680, category: "Pharmacy" },
  { id: 4, item: "Doctor Consultation Fee", charged: 2000, benchmark: 800, overcharge: 1200, category: "Consultation" },
  { id: 5, item: "Room Rent (Semi-Private)", charged: 6000, benchmark: 3500, overcharge: 2500, category: "Room Charges" },
  { id: 6, item: "ICU Monitoring Charges", charged: 18000, benchmark: 11000, overcharge: 7000, category: "ICU" },
  { id: 7, item: "Surgical Gloves (5 pairs)", charged: 800, benchmark: 150, overcharge: 650, category: "Consumables" },
  { id: 8, item: "Saline IV Drip (500ml)", charged: 650, benchmark: 80, overcharge: 570, category: "Pharmacy" },
  { id: 9, item: "ECG Test", charged: 1100, benchmark: 200, overcharge: 900, category: "Diagnostics" },
  { id: 10, item: "Nursing Charges (per day)", charged: 3500, benchmark: 1500, overcharge: 2000, category: "Nursing" },
  { id: 11, item: "Oxygen Cylinder (per day)", charged: 4000, benchmark: 2000, overcharge: 2000, category: "Equipment" },
  { id: 12, item: "Ambulance Charges", charged: 4500, benchmark: 1500, overcharge: 3000, category: "Transport" },
]

const totalCharged = MOCK_ITEMS.reduce((s, i) => s + i.charged, 0)
const totalBenchmark = MOCK_ITEMS.reduce((s, i) => s + i.benchmark, 0)
const totalOvercharge = MOCK_ITEMS.reduce((s, i) => s + i.overcharge, 0)

export const MOCK_ANALYSIS: AnalysisResult = {
  patient: MOCK_PATIENT,
  items: MOCK_ITEMS,
  total_charged: totalCharged,
  total_benchmark: totalBenchmark,
  total_overcharge: totalOvercharge,
  overcharge_percentage: Math.round((totalOvercharge / totalCharged) * 100),
  status: "overcharged",
}

// Simulate async API call with realistic multi-step delay
export const ANALYSIS_STEPS = [
  { id: 1, label: "Uploading document...", delay: 600 },
  { id: 2, label: "Running OCR on bill...", delay: 900 },
  { id: 3, label: "Extracting line items...", delay: 800 },
  { id: 4, label: "Comparing with CGHS benchmarks...", delay: 1000 },
  { id: 5, label: "Generating overcharge report...", delay: 700 },
  { id: 6, label: "Preparing legal letter...", delay: 600 },
]

export function getRandomMockAnalysis(): AnalysisResult {
  const hospitals = ["Fortis Hospital", "Apollo Hospital", "Max Super Speciality", "Medanta - The Medicity", "Sir Ganga Ram Hospital", "AIIMS"]
  const patients = ["Rahul Sharma", "Priya Singh", "Amit Patel", "Sneha Rao", "Vikram Malhotra", "Anjali Gupta"]
  const doctors = ["Dr. Mehta", "Dr. Khanna", "Dr. Reddy", "Dr. Joshi", "Dr. Verma"]
  
  const hospital = hospitals[Math.floor(Math.random() * hospitals.length)]
  const patient = patients[Math.floor(Math.random() * patients.length)]
  const doctor = doctors[Math.floor(Math.random() * doctors.length)]
  const billNum = `BILL-2026-${Math.floor(Math.random() * 90000) + 10000}`
  
  // Randomize item amounts slightly
  const randomizedItems = MOCK_ITEMS.map(it => {
    const variation = 0.8 + (Math.random() * 0.4) // 80% to 120%
    const charged = Math.round(it.charged * variation)
    const benchmark = it.benchmark
    const overcharge = Math.max(0, charged - benchmark)
    return { ...it, charged, overcharge }
  })

  const totalCharged = randomizedItems.reduce((s, i) => s + i.charged, 0)
  const totalOvercharge = randomizedItems.reduce((s, i) => s + i.overcharge, 0)

  return {
    patient: {
      patient_name: patient,
      hospital_name: hospital,
      bill_number: billNum,
      date: new Date().toLocaleDateString("en-IN"),
      doctor_name: doctor,
      ward: "General Ward, Room 202",
    },
    items: randomizedItems,
    total_charged: totalCharged,
    total_benchmark: totalCharged - totalOvercharge,
    total_overcharge: totalOvercharge,
    overcharge_percentage: Math.round((totalOvercharge / totalCharged) * 100),
    status: totalOvercharge > 0 ? "overcharged" : "fair",
  }
}

export async function runMockAnalysis(
  onStepChange: (step: number, label: string) => void
): Promise<AnalysisResult> {
  for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
    const step = ANALYSIS_STEPS[i]
    onStepChange(i + 1, step.label)
    await new Promise(r => setTimeout(r, step.delay))
  }
  return getRandomMockAnalysis()
}
