"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, Variants } from "framer-motion"
import { 
  AlertCircle, FileText, ArrowLeft, ArrowDownToLine, Receipt, 
  FileSearch, TrendingDown, Scale, Stethoscope, ShieldCheck,
  AlertTriangle, CheckSquare, Share2
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { generateReportHTML, downloadHtmlAsPdf } from "@/lib/pdfUtils"

import { OverchargeAlert } from "@/components/OverchargeAlert"
import { BillSummaryCard } from "@/components/BillSummaryCard"
import { BreakdownTable } from "@/components/BreakdownTable"
import { PriceChart } from "@/components/PriceChart"

export default function ResultsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem("medibill_last_analysis")
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse saved analysis", e)
      }
    }
  }, [])

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">No Analysis Found</h2>
          <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-8">
            Upload your medical bill to start the AI auditing process.
          </p>
          <Link href="/upload" className={cn(buttonVariants({ size: "lg" }), "rounded-2xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-95")}>
            Audit Bill Now
          </Link>
        </div>
      </div>
    )
  }

  const items = data.items || []
  const totalCharged = data.total_charged || 0
  const totalOvercharge = data.total_overcharge || 0
  const overchargePercentage = data.overcharge_percentage || 0
  const patient = data.patient || {}

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">AI Audit Complete</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">Bill Analysis Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-bold h-12 px-6" onClick={() => window.print()}>
            <ArrowDownToLine className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button className="rounded-xl bg-white text-black hover:bg-neutral-200 font-bold h-12 px-6 shadow-xl" onClick={() => toast.success("Sharing enabled soon!")}>
            <Share2 className="mr-2 h-4 w-4" /> Share Report
          </Button>
        </div>
      </motion.div>

      {/* Hero Section: Alert + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <OverchargeAlert amount={totalOvercharge} percentage={overchargePercentage} />
          <BillSummaryCard patient={patient} />
        </div>
        <PriceChart billed={totalCharged} benchmark={totalCharged - totalOvercharge} />
      </div>

      {/* Price Breakdown Table */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Receipt className="h-6 w-6 text-primary" />
            Itemized Audit Breakdown
          </h2>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{items.length} Items Found</span>
        </div>
        <BreakdownTable items={items} />
      </motion.div>

      {/* Legal Footer CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-10 rounded-[3rem] border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 text-center"
      >
        <div className="max-w-2xl mx-auto">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-3xl font-black text-white mb-4">Protect Your Rights</h3>
          <p className="text-muted-foreground font-medium mb-8">
            The overcharges found are legally actionable under consumer protection laws. Use our automated notice generator to formally challenge these charges.
          </p>
          <Link href="/letter" className={cn(buttonVariants({ size: "lg" }), "h-16 px-12 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95")}>
            Generate Legal Defense Notice
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

