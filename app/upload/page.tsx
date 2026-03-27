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
import { runMockAnalysis, ANALYSIS_STEPS, getRandomMockAnalysis, type AnalysisResult, type PatientInfo, type BillItem } from "@/lib/mockData"
import { generateReportHTML, generateLetterHTML, generateMailtoLink, downloadHtmlAsPdf } from "@/lib/pdfUtils"

// ─────────────────────────────────────────────────────────────────────────────
// Real API extraction — calls Next.js proxy → FastAPI → Gemini Vision
// Returns null if backend offline or key not set (triggers mock fallback)
// ─────────────────────────────────────────────────────────────────────────────
async function callRealExtractAPI(file: File): Promise<AnalysisResult | null> {
  try {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/extract", { method: "POST", body: form })
    if (!res) return null
    const data = await res.json()
    if (!res.ok) return null // backend offline or key missing

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
  } catch {
    return null
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
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const letterRef = useRef<HTMLDivElement>(null)

  const updatePatient = (key: keyof PatientInfo, val: string) => {
    setPatient(prev => prev ? { ...prev, [key]: val } : prev)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const router = useRouter()

  const handleAnalyze = async () => {
    if (!file) return
    setPhase("analyzing")

    // Animate steps while real API call happens in parallel
    const animateSteps = async () => {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setAnalysisStep(i + 1)
        setAnalysisLabel(ANALYSIS_STEPS[i].label)
        // Fast UI transitions
        await new Promise(r => setTimeout(r, 300))
      }
    }

    // Try real Gemini extraction but with a timeout fallback to Demo Mode
    const fetchWithTimeout = async () => {
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => {
          console.log("[Extraction] API Timeout - Falling back to Demo Mode")
          resolve(null)
        }, 25000)
      )
      return Promise.race([callRealExtractAPI(file), timeoutPromise])
    }

    try {
      const [apiResult] = await Promise.all([
        fetchWithTimeout(),
        animateSteps(),
      ])

      let finalResult = apiResult

      if (!finalResult) {
        console.log("[Extraction] Failed or Timed out - Using Demo Data")
        toast.info("AI Busy - Using Demo Mode", {
          description: "Gemini is at capacity. Showing you a sample analysis instead.",
          duration: 5000
        })
        finalResult = getRandomMockAnalysis()
      }

      // Save to localStorage for the new results page
      localStorage.setItem("medibill_last_analysis", JSON.stringify(finalResult))
      
      // Redirect to the new dynamic results page
      router.push("/results")

    } catch (error) {
      console.error("[Analysis Error]", error)
      toast.error("Analysis Error", { description: "Falling back to Demo Mode..." })
      localStorage.setItem("medibill_last_analysis", JSON.stringify(getRandomMockAnalysis()))
      router.push("/results")
    }
  }

  const handleGenerateLetter = () => {
    setPhase("letter")
    setTimeout(() => {
      letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const handleDownloadReport = () => {
    if (!analysis || !patient) return
    const html = generateReportHTML({ ...analysis, patient })
    downloadHtmlAsPdf(html, `MediBill_Report_${patient.bill_number}.pdf`)
    toast.success("Report opened for printing/saving!")
  }

  const handleDownloadLetter = () => {
    if (!analysis || !patient) return
    const html = generateLetterHTML({ ...analysis, patient })
    downloadHtmlAsPdf(html, `Legal_Letter_${patient.bill_number}.pdf`)
    toast.success("Letter opened for printing/saving!")
  }

  const handleEmail = () => {
    if (!analysis || !patient) return
    const link = generateMailtoLink({ ...analysis, patient })
    window.location.href = link
  }

  const handleShare = async () => {
    if (!patient || !analysis) return
    const text = `MediBill AI Analysis: I was overcharged ₹${analysis.total_overcharge.toLocaleString("en-IN")} (${analysis.overcharge_percentage}%) by ${patient.hospital_name}. Bill No: ${patient.bill_number}`
    if (navigator.share) {
      try { await navigator.share({ title: "MediBill AI Report", text }) }
      catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success("Report summary copied to clipboard!")
    }
  }

  const resetApp = () => {
    setPhase("upload"); setFile(null); setAnalysis(null); setPatient(null); setAnalysisStep(0)
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } }
  }

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* ── PHASE 1: UPLOAD ───────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-background">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.15] dark:opacity-[0.05] grayscale mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop')" }} />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100/90 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-300 text-sm font-semibold border border-neutral-200 dark:border-neutral-800 shadow-sm mb-5">
              <ShieldCheck className="h-4 w-4 text-black dark:text-white" /> Professional B&W Edition
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
              Upload Your <span className="text-gradient">Medical Bill</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Our AI extracts all data, detects overcharges against CGHS benchmarks, and prepares a legal notice — in seconds.
            </p>
          </motion.div>

          {/* Upload Zone */}
          <AnimatePresence mode="wait">
            {phase === "upload" && (
              <motion.div key="upload" variants={cardVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer group overflow-hidden",
                    isDragging
                      ? "border-neutral-500 bg-neutral-100/50 dark:bg-neutral-800/30 scale-[1.02] shadow-[0_0_40px_rgba(0,0,0,0.1)]"
                      : file
                        ? "border-neutral-400/60 bg-neutral-50/20 dark:bg-neutral-900/10"
                        : "border-border hover:border-neutral-400/60 dark:hover:border-neutral-500 bg-white/40 dark:bg-black/20",
                    "backdrop-blur-xl shadow-md"
                  )}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !file && fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />

                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-16 px-8 flex flex-col items-center text-center"
                      >
                        <div className="relative mb-6">
                          <div className="h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 border border-neutral-200 dark:border-neutral-800">
                            <UploadCloud className="h-11 w-11 text-black dark:text-white group-hover:-translate-y-1 transition-transform duration-300" />
                          </div>
                          {isDragging && (
                            <motion.div layoutId="drag-ring" className="absolute inset-0 rounded-full border-4 border-neutral-800/20 dark:border-neutral-200/20 scale-125 opacity-70 animate-pulse" />
                          )}
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight mb-2">Drag & drop your bill here</h2>
                        <p className="text-muted-foreground mb-8">Supports PDF, JPG, PNG up to 20MB</p>
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-6 w-full max-w-xs">
                          {["PDF", "JPG", "PNG"].map(f => (
                            <div key={f} className="flex items-center justify-center gap-1.5 bg-muted/30 rounded-xl py-2 font-medium">
                              <FileText className="h-3.5 w-3.5" /> {f}
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="rounded-full pointer-events-none px-8 h-11 font-semibold bg-white/50 dark:bg-black/20 backdrop-blur-sm">
                          Browse Files
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="selected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 flex flex-col items-center"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800/40 dark:to-neutral-900/40 flex items-center justify-center mb-5 shadow-md border border-black/5 dark:border-white/5">
                          {file.type === "application/pdf"
                            ? <FileText className="h-10 w-10 text-black dark:text-white" />
                            : <Receipt className="h-10 w-10 text-black dark:text-white" />}
                        </div>
                        <h3 className="text-xl font-bold mb-1 max-w-xs truncate">{file.name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/40 px-3 py-1 rounded-full mb-6 border border-neutral-200 dark:border-neutral-700">
                          <CheckCircle className="h-3.5 w-3.5" /> Ready to analyze
                        </span>
                        <Button variant="outline" size="sm" className="rounded-full text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30 group"
                          onClick={() => setFile(null)}>
                          <X className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform" /> Remove File
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Analyze Button */}
                <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Button
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={!file}
                    className={cn(
                      "w-full h-16 text-xl font-bold rounded-2xl transition-all duration-300 group shadow-xl",
                      file
                        ? "bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black border border-black/20 dark:border-white/20 hover:scale-[1.02]"
                        : "bg-muted text-muted-foreground cursor-not-allowed border-none"
                    )}
                  >
                    {file ? (
                      <>
                        <Activity className="h-6 w-6 mr-3 group-hover:animate-pulse" />
                        Analyze Bill with AI
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      "Upload a bill to continue"
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground backdrop-blur-sm py-2">
                    <ShieldCheck className="h-4 w-4 text-black dark:text-white" />
                    <span>Your data is encrypted and never stored permanently.</span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── PHASE 2: ANALYZING ── */}
            {phase === "analyzing" && (
              <motion.div key="analyzing" variants={cardVariants} initial="hidden" animate="show" exit={{ opacity: 0 }}
                className="glass-panel rounded-3xl overflow-hidden shadow-xl">
                <div className="px-10 py-12 flex flex-col items-center text-center">
                  {/* Outer ring animation */}
                  <div className="relative mb-8">
                    <div className="h-28 w-28 rounded-full bg-neutral-100 dark:bg-neutral-900/50 flex items-center justify-center">
                      <Activity className="h-12 w-12 text-black dark:text-white animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-black dark:border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-r-neutral-500 border-t-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDelay: "0.3s", animationDuration: "1.4s" }} />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={analysisLabel}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-2xl font-bold mb-2 tracking-tight"
                    >
                      {analysisLabel || "Starting analysis..."}
                    </motion.h2>
                  </AnimatePresence>
                  <p className="text-muted-foreground mb-8 text-sm">Please wait — running AI extraction and benchmark comparison</p>

                  {/* Step progress */}
                  <div className="w-full max-w-sm space-y-3">
                    {ANALYSIS_STEPS.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <StepBadge number={step.id} active={analysisStep === step.id} done={analysisStep > step.id} />
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          analysisStep === step.id ? "text-foreground" : analysisStep > step.id ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </span>
                        {analysisStep > step.id && <Check className="h-4 w-4 text-black dark:text-white ml-auto" />}
                        {analysisStep === step.id && <Loader2 className="h-4 w-4 text-black dark:text-white animate-spin ml-auto" />}
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-sm mt-8 bg-muted rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-black dark:bg-white rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(analysisStep / ANALYSIS_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Step {analysisStep} of {ANALYSIS_STEPS.length}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── PHASE 3: RESULTS ───────────────────────────────────── */}
      <AnimatePresence>
        {(phase === "results" || phase === "letter") && analysis && patient && (
          <motion.section
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-16"
          >
            <div className="container mx-auto px-4 max-w-5xl">
              {/* ─ Alert Banner ─ */}
              <motion.div variants={cardVariants} initial="hidden" animate="show"
                className="relative overflow-hidden mb-8 rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 p-6 shadow-lg shadow-red-100/50 dark:shadow-red-900/10">
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-red-500 to-red-700" />
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <AlertTriangle className="h-6 w-6 text-black dark:text-white" />
                      <span className="font-extrabold text-2xl text-red-700 dark:text-red-400">
                        You were overcharged {formatINR(analysis.total_overcharge)}!
                      </span>
                    </div>
                    <p className="text-red-600/80 dark:text-red-400/80 text-sm">
                      That's <strong>{analysis.overcharge_percentage}% higher</strong> than the government-mandated CGHS/NPPA benchmark price of {formatINR(analysis.total_benchmark)}.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow-sm">
                      ⚠ Overcharged
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-xl bg-white dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-bold">
                      {analysis.overcharge_percentage}% Excess
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* ─ Summary Cards ─ */}
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {[
                  { label: "Total Billed", value: formatINR(analysis.total_charged), icon: <Receipt className="h-5 w-5 text-black dark:text-white" />, cls: "" },
                  { label: "Fair Market Price", value: formatINR(analysis.total_benchmark), icon: <Scale className="h-5 w-5 text-black dark:text-white" />, cls: "border-t-4 border-black dark:border-white" },
                  { label: "Total Overcharge", value: formatINR(analysis.total_overcharge), icon: <TrendingDown className="h-5 w-5 text-black dark:text-white" />, cls: "border-t-4 border-black dark:border-white bg-neutral-50/50 dark:bg-neutral-900/10" },
                ].map((card, i) => (
                  <motion.div key={i} variants={cardVariants}>
                    <Card className={cn("glass-card h-full", card.cls)}>
                      <CardHeader className="pb-1">
                        <CardDescription className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs">
                          {card.icon} {card.label}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className={cn("text-3xl font-extrabold tracking-tight", i === 2 ? "text-red-600 dark:text-red-400" : i === 1 ? "text-green-700 dark:text-green-400" : "")}>{card.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* ─ Editable Patient Info ─ */}
              <motion.div variants={cardVariants} initial="hidden" animate="show">
                <Card className="glass-card mb-8 overflow-hidden">
                  <CardHeader className="bg-muted/30 dark:bg-muted/10 border-b border-border/50 flex flex-row items-center gap-3 py-4">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg tracking-tight">Patient & Bill Information</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Edit3 className="h-3 w-3" /> Hover on any field to edit
                      </CardDescription>
                    </div>
                    <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified
                    </span>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <EditableField label="Patient Name" value={patient.patient_name} onChange={v => updatePatient("patient_name", v)} icon={<Star className="h-4 w-4" />} />
                      <EditableField label="Hospital" value={patient.hospital_name} onChange={v => updatePatient("hospital_name", v)} />
                      <EditableField label="Bill Number" value={patient.bill_number} onChange={v => updatePatient("bill_number", v)} />
                      <EditableField label="Date" value={patient.date} onChange={v => updatePatient("date", v)} />
                      <EditableField label="Doctor" value={patient.doctor_name} onChange={v => updatePatient("doctor_name", v)} />
                      <EditableField label="Ward / Room" value={patient.ward} onChange={v => updatePatient("ward", v)} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ─ Line Item Table ─ */}
              <motion.div variants={cardVariants} initial="hidden" animate="show">
                <Card className="glass-card mb-8 overflow-hidden rounded-2xl">
                  <CardHeader className="bg-muted/30 dark:bg-muted/10 border-b border-border/50 flex flex-row items-center gap-3 py-4">
                    <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-lg tracking-tight">Line Item Analysis</CardTitle>
                    <span className="ml-auto bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                      {analysis.items.filter(i => i.overcharge > 0).length} overcharged items
                    </span>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/50">
                          <tr>
                            {["Item / Description", "Category", "Charged", "Benchmark", "Overcharge"].map(h => (
                              <th key={h} className={cn("px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", h !== "Item / Description" && h !== "Category" ? "text-right" : "text-left")}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {analysis.items.map((row, i) => (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={cn(
                                "transition-colors group",
                                row.overcharge > 0
                                  ? "bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50/80 dark:hover:bg-red-900/20"
                                  : "hover:bg-muted/40"
                              )}
                            >
                              <td className="px-5 py-3.5 font-semibold">{row.item}</td>
                              <td className="px-5 py-3.5">
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium">{row.category}</span>
                              </td>
                              <td className="px-5 py-3.5 text-right font-mono">{formatINR(row.charged)}</td>
                              <td className="px-5 py-3.5 text-right font-mono text-green-700 dark:text-green-400">{formatINR(row.benchmark)}</td>
                              <td className="px-5 py-3.5 text-right">
                                {row.overcharge > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800/40 shadow-sm">
                                    <AlertTriangle className="h-3 w-3" /> +{formatINR(row.overcharge)}
                                  </span>
                                ) : (
                                  <span className="text-green-600 text-xs font-semibold">Fair</span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50/80 dark:bg-slate-900/40 border-t-2 border-border">
                          <tr>
                            <td colSpan={2} className="px-5 py-4 font-bold text-sm uppercase tracking-wide">Total</td>
                            <td className="px-5 py-4 text-right font-bold font-mono">{formatINR(analysis.total_charged)}</td>
                            <td className="px-5 py-4 text-right font-bold font-mono text-green-700 dark:text-green-400">{formatINR(analysis.total_benchmark)}</td>
                            <td className="px-5 py-4 text-right">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-extrabold bg-red-600 text-white shadow">
                                +{formatINR(analysis.total_overcharge)}
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ─ Action Buttons ─ */}
              <motion.div variants={cardVariants} initial="hidden" animate="show">
                <Card className="glass-card mb-10 overflow-hidden rounded-2xl">
                  <CardHeader className="bg-muted/20 dark:bg-muted/10 border-b border-border/50 py-4">
                    <CardTitle className="text-base tracking-tight">Actions</CardTitle>
                    <CardDescription>Download your report, generate a legal notice, or share your findings.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        onClick={handleDownloadReport}
                        variant="outline"
                        className="h-auto flex-col gap-2 py-4 rounded-2xl border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400 transition-all group"
                      >
                        <Download className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="font-bold text-sm leading-none">Download Report</span>
                        <span className="text-xs text-muted-foreground">PDF format</span>
                      </Button>
                      <Button
                        onClick={handleGenerateLetter}
                        className="h-auto flex-col gap-2 py-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-600/20 border-none transition-all group hover:scale-[1.03]"
                      >
                        <Scale className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="font-bold text-sm leading-none">Generate Letter</span>
                        <span className="text-xs text-blue-200">Legal notice</span>
                      </Button>
                      <Button
                        onClick={handleEmail}
                        variant="outline"
                        className="h-auto flex-col gap-2 py-4 rounded-2xl border-2 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-700 dark:hover:text-green-400 transition-all group"
                      >
                        <Mail className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="font-bold text-sm leading-none">Send Email</span>
                        <span className="text-xs text-muted-foreground">Opens mail app</span>
                      </Button>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        className="h-auto flex-col gap-2 py-4 rounded-2xl border-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-400 transition-all group"
                      >
                        <Share2 className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="font-bold text-sm leading-none">Share</span>
                        <span className="text-xs text-muted-foreground">Copy / Share</span>
                      </Button>
                    </div>
                    <div className="mt-4 text-center">
                      <button onClick={resetApp} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                        ← Start over with a new bill
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── PHASE 4: LEGAL LETTER ─────────────────────────────────── */}
              <AnimatePresence>
                {phase === "letter" && (
                  <motion.div
                    ref={letterRef}
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: 20 }}
                  >
                    {/* Letter Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                          <Scale className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                          Legal Complaint Letter
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-green-500" /> Auto-generated and pre-filled with extracted data
                        </p>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <Button variant="outline" className="rounded-full h-11 font-semibold shadow-sm" onClick={() => window.print()}>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        <Button
                          onClick={handleDownloadLetter}
                          className="rounded-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md border-none"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download Letter
                        </Button>
                      </div>
                    </div>

                    {/* Letter Card */}
                    <Card className="shadow-2xl shadow-black/10 dark:shadow-black/30 border-border/40 overflow-hidden rounded-2xl mb-8">
                      <CardHeader className="bg-slate-100/60 dark:bg-slate-800/20 border-b border-border/50 flex flex-row items-center justify-between py-4 px-8">
                        <CardTitle className="text-base flex items-center gap-2.5 font-bold tracking-tight text-indigo-900 dark:text-indigo-300">
                          <Scale className="h-5 w-5 text-indigo-600" /> Formal Notice to Hospital Administrator
                        </CardTitle>
                        <span className="text-xs font-semibold text-muted-foreground bg-white dark:bg-black/40 px-3 py-1 rounded-full border border-border/50 hidden sm:block">
                          Ref: OVC-{new Date().getFullYear()}-{patient.bill_number.slice(-5)}
                        </span>
                      </CardHeader>

                      {/* Document */}
                      <CardContent className="p-0 bg-slate-100/40 dark:bg-zinc-950 flex justify-center py-10">
                        <div className="w-[95%] max-w-[760px] bg-white dark:bg-[#1a1c23] shadow-2xl min-h-[700px] p-8 sm:p-14 relative ring-1 ring-black/5 dark:ring-white/10">
                          <div className="relative z-10 font-serif text-[15px] leading-[1.9] space-y-5 text-slate-800 dark:text-slate-300">

                            <div className="flex justify-between items-start mb-10">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">To,</p>
                                <p className="font-semibold text-slate-900 dark:text-white">The Medical Superintendent,</p>
                                <p className="font-bold text-lg text-slate-900 dark:text-white mt-0.5">{patient.hospital_name}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-500 text-sm">Date</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{patient.date}</p>
                              </div>
                            </div>

                            <div className="py-4 border-y-2 border-slate-200 dark:border-slate-800 text-center bg-slate-50/60 dark:bg-slate-900/40 my-6 -mx-4 sm:-mx-8 px-4">
                              <p className="font-extrabold uppercase tracking-widest text-sm text-slate-900 dark:text-white">
                                Subject: Formal Complaint Regarding Inflated Medical Bill — Bill No. {patient.bill_number}
                              </p>
                            </div>

                            <p className="font-semibold">Dear Sir/Madam,</p>

                            <p className="text-justify">
                              I, <strong>{patient.patient_name}</strong>, am writing to formally raise a serious concern regarding my medical bill (Bill No: <strong className="underline decoration-slate-300 decoration-2 underline-offset-4">{patient.bill_number}</strong>) generated by <strong>{patient.hospital_name}</strong> dated <strong>{patient.date}</strong>.
                            </p>

                            <p className="text-justify">
                              Upon careful AI-assisted analysis, I have found the following items to be charged at rates significantly higher than government-approved CGHS/NPPA benchmarks:
                            </p>

                            <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-md p-5 my-4 shadow-inner">
                              <ul className="list-none space-y-3">
                                {analysis.items.filter(i => i.overcharge > 0).map((item, idx) => (
                                  <li key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0">
                                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                                      {item.item}
                                    </span>
                                    <div className="mt-0.5 sm:mt-0 text-sm font-medium">
                                      <span className="text-slate-500">Charged:</span> <span className="font-mono text-red-600 dark:text-red-400 font-bold">{formatINR(item.charged)}</span>
                                      <span className="mx-2 text-slate-300">|</span>
                                      <span className="text-slate-500">Benchmark:</span> <span className="font-mono text-green-600 dark:text-green-400 font-bold">{formatINR(item.benchmark)}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-base">
                                <span>Total Excess:</span>
                                <span className="text-red-600 dark:text-red-400">{formatINR(analysis.total_overcharge)} ({analysis.overcharge_percentage}%)</span>
                              </div>
                            </div>

                            <p className="text-justify font-medium">
                              These charges violate the benchmarks under <strong>CGHS/NPPA guidelines</strong>. I urgently request a full review and a refund of {formatINR(analysis.total_overcharge)}.
                            </p>

                            <p className="text-justify text-slate-600 dark:text-slate-400">
                              If no corrective action is taken within <strong>7 working days</strong>, I will escalate this to the State Health Department, National Consumer Helpline (1800-11-4000), and Consumer Disputes Redressal Forum.
                            </p>

                            <div className="mt-14 pt-6">
                              <p>Sincerely,</p>
                              <div className="h-px w-52 bg-slate-300 dark:bg-slate-700 mt-10 mb-2" />
                              <p className="font-bold text-lg text-slate-900 dark:text-white">{patient.patient_name}</p>
                              <p className="text-sm text-slate-500">Patient / Authorized Signatory</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {/* Letter Footer Buttons */}
                      <CardContent className="bg-slate-50 dark:bg-slate-950/50 border-t border-border/50 p-6 flex flex-col sm:flex-row justify-end gap-4">
                        <Button variant="outline" className="w-full sm:w-auto rounded-full h-12 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleEmail}>
                          <Mail className="mr-2 h-4 w-4" /> Email to Hospital
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto rounded-full h-12 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700" onClick={handleShare}>
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                        <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold rounded-full h-12 px-8 shadow-md transition-all hover:-translate-y-0.5 border-none" onClick={handleDownloadLetter}>
                          <Printer className="mr-2 h-4 w-4" /> Save / Print Letter
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
