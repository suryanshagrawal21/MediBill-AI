"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import {
  UploadCloud, File, X, Check, AlertTriangle, FileText, Scale,
  Download, Mail, Share2, ChevronDown, Edit3, CheckCircle,
  Activity, Loader2, ShieldCheck, Receipt, TrendingDown, ArrowRight, Printer,
  Copy, ExternalLink, Star, WifiOff, Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { ANALYSIS_STEPS, type AnalysisResult, type PatientInfo, type BillItem } from "@/lib/mockData"
import { generateReportHTML, generateLetterHTML, generateMailtoLink, downloadHtmlAsPdf } from "@/lib/pdfUtils"

// ─────────────────────────────────────────────────────────────────────────────
// Real API extraction — calls Next.js proxy → FastAPI → Gemini Vision
// Returns rejected promise if backend offline or key not set (triggers error toast)
// ─────────────────────────────────────────────────────────────────────────────
async function callRealExtractAPI(file: File): Promise<AnalysisResult> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch("/api/extract", { method: "POST", body: form })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || data.error || "Could not read the bill. Please upload a correct bill.")
  }

    const items: BillItem[] = (data.items as any[]).map((it: any, i: number) => ({
      id: i + 1,
      item: it.item ?? it.name ?? "Item",
      charged: Number(it.charged ?? 0),
      benchmark: Number(it.benchmark ?? 0),
      overcharge: Number(it.overcharge ?? 0),
      category: it.category ?? "Other",
    }))

    return {
      patient: {
        patient_name: data.patient?.patient_name ?? "Unknown",
        hospital_name: data.patient?.hospital_name ?? "Unknown",
        bill_number: data.patient?.bill_number ?? "Unknown",
        date: data.patient?.date ?? new Date().toLocaleDateString("en-IN"),
        doctor_name: data.patient?.doctor_name ?? "Unknown",
        ward: data.patient?.ward ?? "Unknown",
      },
      items,
      total_charged: Number(data.total_charged ?? 0),
      total_benchmark: Number(data.total_benchmark ?? 0),
      total_overcharge: Number(data.total_overcharge ?? 0),
      overcharge_percentage: Number(data.overcharge_percentage ?? 0),
      status: data.status ?? "overcharged",
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types & helpers
// ─────────────────────────────────────────────────────────────────────────────

type AppPhase = "upload" | "analyzing" | "results" | "letter"

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StepBadge({ number, active, done }: { number: number; active: boolean; done: boolean }) {
  return (
    <div className={cn(
      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all",
      done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900" : "bg-muted text-muted-foreground"
    )}>
      {done ? <Check className="h-4 w-4" /> : number}
    </div>
  )
}

function EditableField({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 group">
        {icon && <span className="text-blue-500 shrink-0">{icon}</span>}
        {editing ? (
          <input
            autoFocus
            className="flex-1 bg-transparent border-b-2 border-blue-500 focus:outline-none text-sm font-semibold py-0.5 text-foreground"
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={() => { setEditing(false); toast.success("Field updated") }}
            onKeyDown={e => e.key === "Enter" && setEditing(false)}
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-foreground">{value}</span>
        )}
        <button
          onClick={() => setEditing(true)}
          className={cn(
            "p-1 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors",
            editing ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const [phase, setPhase] = useState<AppPhase>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [analysisLabel, setAnalysisLabel] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleAnalyze = async () => {
    if (!file) return
    setPhase("analyzing")

    const animateSteps = async () => {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setAnalysisStep(i + 1)
        setAnalysisLabel(ANALYSIS_STEPS[i].label)
        await new Promise(r => setTimeout(r, 800))
      }
    }

    try {
      const [apiResult] = await Promise.all([
        callRealExtractAPI(file),
        animateSteps(),
      ])

      localStorage.setItem("medibill_last_analysis", JSON.stringify(apiResult))
      router.push("/results")
    } catch (error: any) {
      toast.error(error.message || "Could not read the bill. Please upload a correct bill.")
      setPhase("upload")
      setFile(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20 px-6">
      <AnimatePresence mode="wait">
        {phase === "upload" ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-10"
          >
            <div className="text-center">
              <h1 className="text-5xl font-black tracking-tighter text-white mb-4">Scan New Bill</h1>
              <p className="text-muted-foreground font-medium max-w-lg mx-auto">
                Upload your medical bill (PDF or Image) and our AI will audit every line item against CGHS benchmarks.
              </p>
            </div>

            <div
              className={cn(
                "relative border-2 border-dashed rounded-[3rem] transition-all duration-500 cursor-pointer group h-[400px] flex flex-col items-center justify-center",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/20"
                  : file
                    ? "border-primary/50 bg-primary/5"
                    : "border-white/10 hover:border-primary/40 bg-white/5",
                "glass-panel"
              )}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />

              {!file ? (
                <div className="text-center group">
                  <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <UploadCloud className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Drag & Drop Bill</h2>
                  <p className="text-muted-foreground text-sm font-medium">Supports PDF, JPG, or PNG</p>
                </div>
              ) : (
                <div className="text-center animate-in fade-in zoom-in duration-500">
                  <div className="h-24 w-24 rounded-[2rem] bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40">
                    <FileText className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1 truncate max-w-sm">{file.name}</h3>
                  <p className="text-sm text-primary font-bold mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for Audit</p>
                  <Button variant="ghost" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-bold" onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                    <X className="h-4 w-4 mr-2" /> Remove File
                  </Button>
                </div>
              )}
            </div>

            <Button
              size="lg"
              disabled={!file}
              onClick={handleAnalyze}
              className="w-full h-20 rounded-3xl text-xl font-black transition-all duration-300 shadow-2xl shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                  Start AI Audit
                  <ArrowRight className="h-5 w-5" />
                </div>
              ) : "Select a bill to continue"}
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-16 rounded-[4rem] text-center space-y-12"
          >
            <div className="relative h-32 w-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-black text-white mb-2">{analysisLabel || "Initializing AI..."}</h2>
              <p className="text-muted-foreground font-medium">Medical benchmarks are being matched against CGHS/NPPA databases.</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              {ANALYSIS_STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                    analysisStep > step.id ? "bg-emerald-500 text-white" : analysisStep === step.id ? "bg-primary text-white scale-110 shadow-lg" : "bg-white/5 text-muted-foreground"
                  )}>
                    {analysisStep > step.id ? <Check className="h-3 w-3" /> : step.id}
                  </div>
                  <span className={cn(
                    "text-sm font-bold transition-all",
                    analysisStep === step.id ? "text-white" : "text-muted-foreground"
                  )}>{step.label}</span>
                  {analysisStep === step.id && <Loader2 className="h-4 w-4 text-primary animate-spin ml-auto" />}
                </div>
              ))}
            </div>
            
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                animate={{ width: `${(analysisStep / ANALYSIS_STEPS.length) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
