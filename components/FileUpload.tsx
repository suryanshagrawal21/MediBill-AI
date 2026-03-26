"use client"

import { useState, useCallback } from "react"
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (file: File) => void
  isAnalyzing: boolean
}

export function FileUpload({ onUpload, isAnalyzing }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }, [])

  const validateAndSetFile = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or an image file (JPG, PNG)")
      return
    }
    setError(null)
    setFile(file)
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card
        className={cn(
          "relative group transition-all duration-300 border-2 border-dashed overflow-hidden",
          isDragging ? "border-primary bg-primary/5 shadow-inner scale-[0.99]" : "border-border hover:border-primary/50",
          file ? "border-primary/50 bg-primary/[0.02]" : "p-12"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center text-center py-6"
            >
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload your hospital bill</h3>
              <p className="text-muted-foreground mb-8 max-w-xs">
                Drag and drop your PDF or image file here, or click to browse
              </p>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,image/*"
              />
              <Button variant="outline" className="rounded-full px-8 pointer-events-none">
                Select File
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <File className="h-8 w-8 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg max-w-[240px] truncate">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-6 w-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm"
        >
          <AlertCircle className="h-5 w-5" />
          {error}
        </motion.div>
      )}

      {file && !isAnalyzing && (
        <Button
          onClick={() => onUpload(file)}
          className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-1"
        >
          Analyze Bill
        </Button>
      )}

      {isAnalyzing && (
        <Button disabled className="w-full h-14 rounded-2xl text-lg font-semibold">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Analyzing your bill...
        </Button>
      )}
    </div>
  )
}
