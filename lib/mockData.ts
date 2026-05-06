export interface BillItem {
  id: number
  item: string
  charged: number
  benchmark: number
  overcharge: number
  category: string
  quantity: number
  is_overcharged: boolean
  unit_price?: number
  benchmark_source?: string
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

// Analytics steps for the UI loader
export const ANALYSIS_STEPS = [
  { id: 1, label: "Uploading document...", delay: 600 },
  { id: 2, label: "Running OCR on bill...", delay: 900 },
  { id: 3, label: "Extracting line items...", delay: 800 },
  { id: 4, label: "Comparing with CGHS benchmarks...", delay: 1000 },
  { id: 5, label: "Generating overcharge report...", delay: 700 },
  { id: 6, label: "Preparing legal letter...", delay: 600 },
]

