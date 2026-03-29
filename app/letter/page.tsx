"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft, Download, Send, Scale, Printer, CheckCircle, 
  FileText, ShieldAlert, Mail, Share2
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { generateLetterHTML, generateMailtoLink, downloadHtmlAsPdf } from "@/lib/pdfUtils"

export default function LetterPage() {
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

  const handleEmail = () => {
    if (!data) return
    const link = generateMailtoLink(data)
    window.location.href = link
    toast.success("Opening email client...")
  }

  const handleSavePDF = () => {
    if (!data) return
    const html = generateLetterHTML(data)
    downloadHtmlAsPdf(html, `Legal_Notice_${data.patient?.bill_number || "Draft"}.pdf`)
    toast.success("Generating Legal Notice...")
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Scale className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">No Data Available</h2>
          <p className="text-muted-foreground font-medium max-w-xs mx-auto mb-8">
            Complete a bill audit to generate a legal notice for overcharges.
          </p>
          <Link href="/upload" className={cn(buttonVariants({ size: "lg" }), "rounded-2xl px-8 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-95")}>
            Audit Bill Now
          </Link>
        </div>
      </div>
    )
  }

  const patient = data.patient || {}
  const items = (data.items || []).filter((it: any) => it.overcharge > 0)
  const dateStr = patient.date || new Date().toLocaleDateString("en-IN")

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <Link href="/results" className="h-12 w-12 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Legal Defense</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">Complaint Draft</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-bold h-12 px-6" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Notice
          </Button>
          <Button className="rounded-xl bg-white text-black hover:bg-neutral-200 font-bold h-12 px-8 shadow-xl" onClick={handleSavePDF}>
            <Download className="mr-2 h-4 w-4" /> Save PDF
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel overflow-hidden rounded-[3rem] border-white/5"
      >
        {/* Document Viewer */}
        <div className="bg-black/40 flex justify-center py-16 sm:py-24 px-4 overflow-x-auto">
          <div className="w-full max-w-[800px] bg-white text-zinc-900 shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-[1050px] p-12 sm:p-20 relative flex flex-col shrink-0">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
              <Scale className="w-[500px] h-[500px] -rotate-12" />
            </div>

            <div className="relative z-10 font-serif leading-[1.8] space-y-8 flex-1">
              {/* Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-10">
                <div className="space-y-1">
                  <p className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-400">Recipient</p>
                  <p className="font-bold text-lg">Hospital Administrator</p>
                  <p className="font-black text-2xl text-primary leading-tight">{patient.hospital_name}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-400">Filing Date</p>
                  <p className="font-bold text-lg">{dateStr}</p>
                </div>
              </div>

              {/* Subject */}
              <div className="py-6 border-y-2 border-zinc-900/5 my-8 text-center bg-zinc-50 flex items-center justify-center px-6">
                <p className="font-black uppercase tracking-widest text-sm leading-relaxed max-w-lg">
                  Subject: Formal Grievance & Request for Refund — Inflated Medical Charges (Bill: {patient.bill_number})
                </p>
              </div>

              <div className="space-y-6 text-[17px]">
                <p className="font-bold">To Whom It May Concern,</p>

                <p>
                  I, <strong>{patient.patient_name}</strong>, am writing to formally contest the charges itemized in medical bill number <strong>{patient.bill_number}</strong> issued by <strong>{patient.hospital_name}</strong>.
                </p>

                <p>
                  Based on a comprehensive audit conducted using AI protocols and government-mandated price benchmarks (CGHS/NPPA), the following discrepancies were identified:
                </p>

                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden my-8">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-100 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Service/Item</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Billed Amount</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right text-emerald-600">Fair Bench.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 font-bold text-zinc-700">{item.item}</td>
                          <td className="px-6 py-4 font-bold text-right text-rose-600">₹{item.charged.toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4 font-bold text-right text-emerald-600">₹{item.benchmark.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-zinc-900 text-white font-bold">
                      <tr>
                        <td className="px-6 py-4">TOTAL OVERCHARGE DISCOVERED</td>
                        <td colSpan={2} className="px-6 py-4 text-right text-rose-400 text-lg">
                          ₹{data.total_overcharge.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p>
                  These charges appear to be in direct violation of the pricing transparency and fair practice standards. I request an immediate review of these line items and a refund of the excess amount of <strong>₹{data.total_overcharge.toLocaleString("en-IN")}</strong>.
                </p>

                <p>
                  I expect a formal response and a revised invoice within 7 business days. Failure to address this grievance will result in escalation to the National Consumer Helpline and the State Medical Council.
                </p>
              </div>

              {/* Signature */}
              <div className="pt-20 mt-auto">
                <p className="font-bold flex items-center gap-2 mb-12">
                  <span className="h-0.5 w-12 bg-zinc-900" />
                  Respectfully,
                </p>
                <p className="font-black text-3xl tracking-tighter uppercase text-zinc-900 mb-1">{patient.patient_name}</p>
                <div className="h-1 w-48 bg-primary mb-2" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white/5 border-t border-white/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground max-w-[240px]">
              This document was generated using verified benchmark data.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-white/10 hover:bg-white/5 font-bold h-14 px-8" onClick={handleEmail}>
              <Mail className="mr-2 h-5 w-5" /> Email to Hospital
            </Button>
            <Button className="flex-1 sm:flex-none h-14 rounded-xl bg-primary text-primary-foreground font-black px-10 shadow-xl shadow-primary/20" onClick={handleSavePDF}>
              <Send className="mr-2 h-5 w-5" /> File Complaint Now
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
