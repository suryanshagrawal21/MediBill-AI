"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/FileUpload"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { uploadBill, analyzeBill } from "@/lib/api"

export default function AnalyzePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleUpload = async (file: File) => {
    setIsAnalyzing(true)

    try {
      // 1. Upload and OCR
      const uploadRes = await uploadBill(file)

      // 2. Analyze
      const analysisRes = await analyzeBill(uploadRes.items)

      // Store results for the next page
      localStorage.setItem("billAnalysis", JSON.stringify(analysisRes))

      toast.success("Analysis complete!", {
        description: "We've identified potential overcharges in your bill.",
      })

      router.push("/results")
    } catch (error) {
      console.error(error)
      toast.error("Analysis failed", {
        description: "There was an error processing your bill. Please try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">Analyze Your Bill</h1>
        <p className="text-lg text-muted-foreground">
          Upload your medical bill (PDF or Image) and our AI will cross-reference it with
          fair market benchmarks to detect overcharges.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <FileUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />
      </motion.div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto border-t pt-12">
        <div>
          <h4 className="font-semibold mb-2">Secure & Private</h4>
          <p className="text-sm text-muted-foreground">Your documents are encrypted and only used for analysis.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">State Benchmarks</h4>
          <p className="text-sm text-muted-foreground">We use official state-level medical price transparency data.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">98% Accuracy</h4>
          <p className="text-sm text-muted-foreground">Our AI model is trained on millions of medical line items.</p>
        </div>
      </div>
    </div>
  )
}
