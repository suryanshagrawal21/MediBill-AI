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

  const handleDownload = () => {
    if (!data) return
    const html = generateReportHTML(data)
    downloadHtmlAsPdf(html, `MediBill_Report_${data.patient?.bill_number || "Draft"}.pdf`)
    toast.success("Generating Report...")
  }

  const handleShare = async () => {
    if (!data) return
    const text = `MediBill AI Analysis: I found ₹${data.total_overcharge.toLocaleString("en-IN")} overcharge in my medical bill at ${data.patient?.hospital_name}. Check your bills at MediBill AI!`
    if (navigator.share) {
      try {
        await navigator.share({ title: "MediBill AI Report", text, url: window.location.origin })
      } catch (e) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success("Report summary copied to clipboard!")
    }
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Stethoscope className="h-12 w-12 text-muted-foreground animate-pulse" />
        <p className="text-muted-foreground font-medium">No analysis data found. Please upload a bill first.</p>
        <Link href="/upload" className={buttonVariants({ variant: "outline" })}>
          Go to Upload
        </Link>
      </div>
    )
  }

  const items = data.items || []
  const totalCharged = data.total_charged || 0
  const totalOvercharge = data.total_overcharge || 0
  const overchargePercentage = data.overcharge_percentage || 0
  const isFair = data.status === "fair"

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl relative min-h-[calc(100vh-8rem)]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neutral-500/5 dark:bg-white/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-10"
      >
        <Link href="/upload" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-border/50 shadow-sm")}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="h-5 w-5 text-black dark:text-white" />
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Analysis Report</h1>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-2 font-medium">
            <Receipt className="h-4 w-4" /> {data.file || "hospital_bill.pdf"}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full border-2 border-black/10 hover:border-black transition-all"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
      >
        <Alert 
          variant={isFair ? "default" : "destructive"} 
          className={cn(
            "mb-10 border-2 backdrop-blur-md relative overflow-hidden shadow-xl py-6",
            isFair 
              ? "border-black bg-white dark:bg-neutral-900/50 text-black dark:text-white" 
              : "border-black bg-neutral-50 dark:bg-black/40 text-black dark:text-white"
          )}
        >
          <div className="absolute right-0 top-0 h-full w-2 bg-black dark:bg-white" />
          {isFair ? (
            <ShieldCheck className="h-8 w-8 !text-black dark:!text-white" />
          ) : (
            <AlertTriangle className="h-8 w-8 !text-black dark:!text-white" />
          )}
          <div className="ml-4">
            <AlertTitle className="text-xl font-black uppercase tracking-tight mb-2">
              {isFair ? "Fair Pricing Detected" : "Overcharge Detected"}
            </AlertTitle>
            <AlertDescription className="text-lg mt-2 leading-relaxed font-medium">
              {isFair 
                ? "Our analysis shows your bill is consistent with standard medical benchmarks. No significant overcharging was found."
                : <>Our AI analysis indicates you were overcharged by <span className="font-black underline underline-offset-4 text-2xl tracking-tighter">₹{totalOvercharge.toLocaleString("en-IN")}</span> ({overchargePercentage}% above standard rates).</>
              }
            </AlertDescription>
          </div>
        </Alert>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-md hover:shadow-lg transition-all border-2 border-black/10 dark:border-white/10 dark:bg-neutral-900/40">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Billed</CardDescription>
              <CardTitle className="text-3xl font-black tracking-tight">₹{totalCharged.toLocaleString("en-IN")}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="shadow-md hover:shadow-lg transition-all border-2 border-black/10 dark:border-white/10 dark:bg-neutral-900/40">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5" /> Fair Marker Price
              </CardDescription>
              <CardTitle className="text-3xl font-black tracking-tight">₹{(totalCharged - totalOvercharge).toLocaleString("en-IN")}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border-2 border-black bg-black text-white dark:bg-white dark:text-black relative overflow-hidden group">
            <CardHeader className="pb-2 relative z-10">
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5" /> Potential Savings
              </CardDescription>
              <CardTitle className="text-4xl font-black tracking-tighter">₹{totalOvercharge.toLocaleString("en-IN")}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-10 shadow-lg border-2 border-black/20 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-neutral-50/50 dark:bg-black/20 border-b border-border/50 py-5">
            <CardTitle className="text-xl flex items-center gap-2 font-black tracking-tight uppercase">
              <FileSearch className="h-5 w-5" /> Itemized Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[10px] uppercase bg-black text-white dark:bg-white dark:text-black font-black tracking-[0.2em]">
                  <tr>
                    <th scope="col" className="px-6 py-5">Description</th>
                    <th scope="col" className="px-6 py-5 text-right">Charged</th>
                    <th scope="col" className="px-6 py-5 text-right">Standard</th>
                    <th scope="col" className="px-6 py-5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {items.map((row: any, index: number) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      key={index} 
                      className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-5 font-bold text-foreground">
                        <div className="flex flex-col">
                          <span>{row.item}</span>
                          <span className="text-[10px] uppercase text-muted-foreground font-medium mt-0.5">{row.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black">₹{row.charged.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5 text-right text-muted-foreground font-bold">₹{row.benchmark.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5 text-right">
                        {row.overcharge > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black bg-black text-white dark:bg-white dark:text-black border border-black shadow-sm">
                            OVERCHARGE (₹{row.overcharge.toLocaleString("en-IN")})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black border border-neutral-300 dark:border-neutral-700 text-muted-foreground">
                            FAIR PRICE
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 mb-20"
      >
        <Button 
          variant="outline" 
          className="w-full sm:w-auto rounded-xl h-14 px-8 font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black transition-all shadow-md"
          onClick={handleDownload}
        >
          <ArrowDownToLine className="mr-2 h-5 w-5" /> Download PDF
        </Button>
        <Link 
          href="/letter" 
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full sm:w-auto bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black shadow-xl transition-all hover:-translate-y-1 font-black uppercase tracking-widest rounded-xl h-16 px-10 border-2 border-transparent"
          )}
        >
          Draft Legal Notice <FileText className="ml-2 h-5 w-5" />
        </Link>
      </motion.div>
    </div>
  )
}

