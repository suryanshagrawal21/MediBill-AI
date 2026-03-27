"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Download, Send, Scale, Printer, CheckCircle, Stethoscope, FileText, ShieldAlert } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Stethoscope className="h-12 w-12 text-muted-foreground animate-pulse" />
        <p className="text-muted-foreground font-medium">No letter data found. Please complete an analysis first.</p>
        <Link href="/upload" className={buttonVariants({ variant: "outline" })}>
          Go to Upload
        </Link>
      </div>
    )
  }

  const patient = data.patient || {}
  const items = (data.items || []).filter((it: any) => it.overcharge > 0)
  const dateStr = patient.date || new Date().toLocaleDateString("en-IN")

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl min-h-[calc(100vh-8rem)] relative">
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-neutral-100 to-transparent dark:from-neutral-900/20 pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
      >
        <div className="flex items-center gap-4">
          <Link href="/results" className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full shadow-sm bg-white/60 dark:bg-card/60 backdrop-blur-md border-black/20 hover:bg-black hover:text-white transition-all")}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scale className="h-5 w-5 text-black dark:text-white" />
              <h1 className="text-3xl font-black uppercase tracking-tight">Legal Draft</h1>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
              <CheckCircle className="h-4 w-4 text-black dark:text-white" /> AI-generated complaint draft
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex rounded-xl h-12 px-6 shadow-sm font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-all" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button className="bg-black text-white dark:bg-white dark:text-black rounded-xl h-12 px-8 font-black uppercase tracking-widest shadow-xl border-2 border-transparent hover:scale-105 transition-all">
            <Download className="mr-2 h-4 w-4" /> Save PDF
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, type: "spring", damping: 25 }}
      >
        <Card className="shadow-2xl border-2 border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-neutral-900/40">
          <CardHeader className="bg-neutral-50/50 dark:bg-black/40 border-b border-black/20 flex flex-row items-center justify-between py-6 px-6 sm:px-10">
            <CardTitle className="text-lg flex items-center gap-2.5 font-black uppercase tracking-tighter text-black dark:text-white">
              <ShieldAlert className="h-5 w-5" />
              Notice to Administrator
            </CardTitle>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white dark:bg-black px-3 py-1 rounded-full border border-black/20 shadow-sm hidden sm:inline-block">Ref: {patient.bill_number || "OVC-PENDING"}</span>
          </CardHeader>
          
          <CardContent className="p-0 bg-neutral-100 dark:bg-black flex justify-center py-12 sm:py-20">
            <div className="w-[90%] max-w-[800px] bg-white dark:bg-neutral-900 shadow-2xl min-h-[700px] p-8 sm:p-20 relative overflow-hidden border border-black/10">
              <div className="relative z-10 font-serif text-[15px] sm:text-[17px] leading-8 space-y-8 text-black dark:text-neutral-200 max-w-2xl mx-auto">
                
                <div className="flex justify-between items-start mb-16">
                  <div>
                    <p className="font-black uppercase text-[12px] tracking-widest text-muted-foreground mb-1">TO:</p>
                    <p className="font-bold">Medical Superintendent,</p>
                    <p className="font-black text-xl mt-1">{patient.hospital_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black uppercase text-[12px] tracking-widest text-muted-foreground mb-1">DATE:</p>
                    <p className="font-bold">{dateStr}</p>
                  </div>
                </div>

                <div className="py-6 border-y-4 border-black mt-8 mb-10 text-center bg-neutral-50 dark:bg-neutral-800/30">
                  <p className="font-black uppercase tracking-widest text-sm leading-6 px-4">
                    Subject: Formal Complaint Regarding Inflation of Medical Bill Charges
                  </p>
                </div>

                <p className="font-bold">Dear Sir/Madam,</p>

                <p className="text-justify">
                  I, <strong>{patient.patient_name}</strong>, am writing to formally raise a serious concern regarding the medical bill generated for my recent treatment (Bill No: <span className="font-black underline decoration-2 underline-offset-4">{patient.bill_number}</span>) dated <strong>{dateStr}</strong>.
                </p>

                <p className="text-justify">
                  After professional AI analysis compared against government-approved benchmarks (CGHS/NPPA), I have identified significant overcharging in the following line items:
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-800/20 border-2 border-dashed border-black/20 rounded-xl p-8 my-8">
                  <ul className="list-none space-y-6">
                    {items.length > 0 ? items.map((item: any, idx: number) => (
                      <li key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-black/10 pb-4 last:border-0 last:pb-0">
                        <span className="font-bold flex items-center gap-3">
                          <Stethoscope className="h-4 w-4" />
                          {item.item}
                        </span>
                        <div className="mt-2 sm:mt-0 text-[13px] font-medium">
                          <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Billed:</span> <span className="font-black ml-1">₹{item.charged.toLocaleString("en-IN")}</span>
                          <span className="mx-3 text-neutral-300">|</span>
                          <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Fair:</span> <span className="font-black ml-1">₹{item.benchmark.toLocaleString("en-IN")}</span>
                        </div>
                      </li>
                    )) : (
                      <li className="text-center font-bold text-muted-foreground italic">No overcharged items detected in analysis</li>
                    )}
                  </ul>
                </div>

                <p className="text-justify font-medium">
                  These charges appear to be in direct contradiction with standard medical pricing guidelines. I request an immediate review of this bill and an adjustment of the excess amount.
                </p>

                <p className="text-justify text-muted-foreground italic text-sm">
                  Failure to receive a response within 7 working days will result in escalation to the appropriate consumer protection and healthcare regulatory bodies.
                </p>

                <div className="mt-20 pt-10">
                  <p className="mb-10">Sincerely,</p>
                  <p className="font-black text-2xl tracking-tighter uppercase">{patient.patient_name}</p>
                  <div className="h-0.5 w-48 bg-black mt-2 mb-2"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Authorized Patient Signatory</p>
                </div>

              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-neutral-50 dark:bg-black border-t border-black/20 p-8 sm:px-10 flex flex-col sm:flex-row justify-end gap-5">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl h-14 px-8 font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-all shadow-md">
              <Send className="mr-2 h-5 w-5" /> Send to Hospital
            </Button>
            <Button className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest rounded-xl h-14 px-10 shadow-xl border-2 border-transparent">
              <Printer className="mr-2 h-5 w-5" /> Print Notice
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

