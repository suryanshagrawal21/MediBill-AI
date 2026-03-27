"use client"

import Link from "next/link"
import { ArrowLeft, Download, Send, Scale, Printer } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function LetterPage() {
  // Simulated extracted and parsed dynamic data
  const dynamicData = {
    patient_name: "Rahul Sharma",
    hospital_name: "ABC Hospital",
    bill_number: "B12345",
    date: "12-03-2026",
    overcharged_items: [
      { item: "Paracetamol", charged: 85, benchmark: 2 },
      { item: "ICU Charges", charged: 18000, benchmark: 11000 }
    ]
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/results" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Legal Complaint Letter</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-full px-6">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Card className="shadow-lg border-muted">
        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg flex items-center gap-2 font-medium">
            <Scale className="h-5 w-5 text-blue-600" />
            Formal Notice to Hospital Administrator
          </CardTitle>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">Ref: OVC-2026-9842</span>
        </CardHeader>
        
        {/* Scrollable Document View */}
        <CardContent className="p-0">
          <div className="h-[60vh] overflow-y-auto p-8 sm:p-12 bg-white dark:bg-card document-scroll">
            <div className="max-w-3xl mx-auto font-serif text-[15px] leading-relaxed space-y-6 text-slate-800 dark:text-slate-300">
              
              <div>
                <p>To,</p>
                <p>The Medical Superintendent,</p>
                <p className="font-bold">{dynamicData.hospital_name}</p>
              </div>

              <div className="pt-2 pb-2 border-y border-dashed mt-6 mb-6">
                <p className="font-bold uppercase tracking-wide text-sm">
                  Subject: Complaint Regarding Inflated Medical Bill
                </p>
              </div>

              <p>Dear Sir/Madam,</p>

              <p>
                I, <strong>{dynamicData.patient_name}</strong>, am writing to raise a concern regarding my medical bill (Bill No: <strong>{dynamicData.bill_number}</strong>) dated <strong>{dynamicData.date}</strong>.
              </p>

              <p>
                Upon reviewing the bill, I found that the following items have been charged significantly higher than the government-approved rates:
              </p>

              <ul className="list-disc pl-8 space-y-2 my-4">
                {dynamicData.overcharged_items.map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.item}:</strong> Charged at ₹{item.charged} against a benchmark of ₹{item.benchmark}.
                  </li>
                ))}
              </ul>

              <p>
                These charges exceed the benchmarks defined under CGHS/NPPA guidelines.
              </p>

              <p>
                I request a review of the bill and a refund of the excess amount charged.
              </p>

              <p>
                If no action is taken within 7 days, I will escalate this matter to the appropriate consumer authorities.
              </p>

              <div className="mt-12">
                <p>Sincerely,</p>
                <div className="h-16 w-48 border-b-2 border-slate-300 dark:border-slate-600 mt-4 mb-2"></div>
                <p className="font-bold">{dynamicData.patient_name}</p>
              </div>

            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 border-t p-4 flex justify-end gap-4">
          <Button variant="outline" className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" /> Email to Hospital
          </Button>
          <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium rounded-full px-6 shadow-md transition-all">
            <Download className="mr-2 h-4 w-4" /> Save as PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
