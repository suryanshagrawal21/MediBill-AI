"use client"

import { Card } from "@/components/ui/card"
import { User, Hospital, Calendar, Hash, UserCheck, Bed } from "lucide-react"

interface BillSummaryProps {
  patient: {
    patient_name: string
    hospital_name: string
    bill_number: string
    date: string
    doctor_name: string
    ward: string
  }
}

export function BillSummaryCard({ patient }: BillSummaryProps) {
  const details = [
    { label: "Patient", value: patient.patient_name, icon: User },
    { label: "Hospital", value: patient.hospital_name, icon: Hospital },
    { label: "Bill ID", value: patient.bill_number, icon: Hash },
    { label: "Date", value: patient.date, icon: Calendar },
    { label: "Doctor", value: patient.doctor_name, icon: UserCheck },
    { label: "Ward", value: patient.ward, icon: Bed },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {details.map((item) => (
        <div key={item.label} className="glass-card p-4 rounded-2xl flex items-center gap-4 group">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <item.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="text-sm font-bold text-white truncate max-w-[150px]">{item.value || "Not found"}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
