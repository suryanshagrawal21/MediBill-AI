"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { SummaryCards } from "@/components/SummaryCards"
import { BillTable, BillItem } from "@/components/BillTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Share2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateReport, generateLegalLetter } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function ResultsPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [legalLetter, setLegalLetter] = useState<string | null>(null)

  useEffect(() => {
    const storedAnalysis = localStorage.getItem("billAnalysis")
    if (storedAnalysis) {
      setAnalysis(JSON.parse(storedAnalysis))
    }
  }, [])

  if (!analysis) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">No analysis data found.</h2>
        <Button onClick={() => window.location.href = "/analyze"}>Go to Analyze</Button>
      </div>
    )
  }

  const totalBill = analysis.total_bill
  const totalOvercharge = analysis.total_overcharge
  const percentageOvercharge = analysis.percent_overcharge
  const items = analysis.items.map((item: any, index: number) => ({
    id: index.toString(),
    name: item.item_name,
    chargedPrice: item.charged_price,
    benchmarkPrice: item.benchmark_price,
    difference: item.difference,
    isOvercharged: item.is_overcharged
  }))

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await generateReport(analysis)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "MediBill_Analysis_Report.pdf"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("PDF Report downloaded successfully!")
    } catch (error) {
      toast.error("Failed to download report")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleLegalLetter = async () => {
    setIsGenerating(true)
    try {
      const res = await generateLegalLetter(analysis)
      setLegalLetter(res.letter)
      toast.success("Legal letter generated!", {
        description: "Review your letter below.",
      })
    } catch (error) {
      toast.error("Failed to generate legal letter")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-12 lg:py-16 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
          <p className="text-muted-foreground text-sm">Report ID: MB-{Math.floor(Math.random() * 10000)} • Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading} className="rounded-xl">
            <Download className="mr-2 h-4 w-4" /> {isDownloading ? "Downloading..." : "Download Report"}
          </Button>
          <Button onClick={handleLegalLetter} disabled={isGenerating} className="rounded-xl shadow-lg shadow-primary/20">
            <FileText className="mr-2 h-4 w-4" /> {isGenerating ? "Generating..." : "Generate Legal Letter"}
          </Button>
        </div>
      </div>

      <Alert className={cn("bg-destructive/5 border-destructive/20 text-destructive-foreground", totalOvercharge === 0 && "bg-green-500/5 border-green-500/20 text-green-700")}>
        <AlertDescription className="flex items-center gap-2">
          {totalOvercharge > 0 ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">Significant Overcharges Detected:</span>
              We found potential savings of ₹{totalOvercharge.toLocaleString()} in your bill based on government benchmarks.
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-600">No Overcharges Detected:</span>
              Your bill seems to align with government benchmarks.
            </>
          )}
        </AlertDescription>
      </Alert>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SummaryCards
          totalBill={totalBill}
          totalOvercharge={totalOvercharge}
          percentageOvercharge={percentageOvercharge}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Line Item Breakdown</h3>
          <p className="text-xs text-muted-foreground italic">* Prices based on CGHS & NPPA benchmarks</p>
        </div>
        <BillTable items={items} />
      </motion.div>

      {legalLetter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <Card className="rounded-3xl border-2 border-primary/20 p-8 bg-white shadow-xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Legal Complaint Letter
            </h3>
            <div className="bg-muted/30 p-8 rounded-2xl whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground border border-border">
              {legalLetter}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => {
                const blob = new Blob([legalLetter], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Legal_Complaint_Letter.txt';
                a.click();
              }} variant="outline" className="rounded-xl">
                Download Letter (.txt)
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card className="rounded-3xl border-none shadow-sm bg-muted/20 p-8">
          <h3 className="text-xl font-bold mb-4">Next Steps</h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
              <p className="text-sm">Download the detailed legal complaint report generated by our system.</p>
            </li>
            <li className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
              <p className="text-sm">Contact the hospital's billing department and provide them with the report ID.</p>
            </li>
            <li className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0 mt-0.5">3</div>
              <p className="text-sm">Request an Itemized Bill and compare it again if discrepancies persist.</p>
            </li>
          </ul>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-primary/5 p-8 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Need Professional Help?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Talk to a medical billing advocate who can handle the dispute for you on a contingency basis.
          </p>
          <Button variant="secondary" className="rounded-full w-full max-w-[200px]">Consult an Expert</Button>
        </Card>
      </div>
    </div>
  )
}
