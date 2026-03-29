"use client"

import { motion } from "framer-motion"
import { History, Search, Filter, Download, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const MOCK_HISTORY = [
  { id: 1, hospital: "Apollo Hospitals", date: "24 Mar 2026", amount: 45200, overcharge: 12400, status: "overcharged" },
  { id: 2, hospital: "Max Healthcare", date: "18 Mar 2026", amount: 12500, overcharge: 0, status: "fair" },
  { id: 3, hospital: "Fortis Memorial", date: "10 Mar 2026", amount: 89000, overcharge: 21000, status: "overcharged" },
]

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Audit History</h1>
          <p className="text-muted-foreground font-medium">Review your previous bill analyses and legal notices.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search hospitals..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
            />
          </div>
          <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 font-bold">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hospital / Facility</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Analysis Date</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Billed</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">AI Audit Result</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_HISTORY.map((item, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={item.id} 
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-8 py-6">
                  <p className="font-bold text-white group-hover:text-primary transition-colors">{item.hospital}</p>
                  <p className="text-xs text-muted-foreground">Bill #MG-{202400 + item.id}</p>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-muted-foreground">{item.date}</td>
                <td className="px-8 py-6 text-sm font-black text-white">₹{item.amount.toLocaleString("en-IN")}</td>
                <td className="px-8 py-6">
                  {item.overcharge > 0 ? (
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Overcharged (₹{item.overcharge.toLocaleString("en-IN")})
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Fair Price
                    </div>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white rounded-lg">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Link href="/results">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-lg">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center py-10">
        <p className="text-sm text-muted-foreground mb-4">Showing all previous audits.</p>
        <Link href="/upload">
          <Button className="rounded-xl bg-primary text-primary-foreground font-black px-8 h-12">
            Scan New Bill
          </Button>
        </Link>
      </div>
    </div>
  )
}
