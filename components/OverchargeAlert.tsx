"use client"

import { AlertTriangle, TrendingDown, Scale, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

interface OverchargeAlertProps {
  amount: number
  percentage: number
}

export function OverchargeAlert({ amount, percentage }: OverchargeAlertProps) {
  if (amount <= 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-rose-500/10 -z-10 blur-3xl group-hover:bg-rose-500/20 transition-all duration-700" />
      
      <div className="glass-card border-rose-500/30 p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 rounded-3xl bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/40 shrink-0">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-rose-500 font-black uppercase tracking-[0.2em] text-xs mb-2">Overpricing Alert</p>
              <h2 className="text-5xl font-black text-white mb-2 leading-none">
                ₹{amount.toLocaleString()} <span className="text-xl font-bold text-rose-500/60 tracking-tight">({percentage}% excess)</span>
              </h2>
              <p className="text-muted-foreground font-medium max-w-md">
                We've detected significant overcharging on your bill compared to government benchmark rates.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link 
              href="/letter"
              className="px-8 h-14 rounded-2xl bg-rose-500 text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all"
            >
              <Scale className="h-5 w-5" />
              Build Legal Notice
            </Link>
            <button className="px-8 h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <TrendingDown className="h-5 w-5 text-rose-500" />
              Download Report
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-rose-500/20 flex flex-wrap gap-4">
          <span className="text-[10px] font-bold text-rose-500/80 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10 uppercase tracking-widest leading-none">CGHS Violation Found</span>
          <span className="text-[10px] font-bold text-rose-500/80 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10 uppercase tracking-widest leading-none">Legal Grounds Verified</span>
          <span className="text-[10px] font-bold text-rose-500/80 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10 uppercase tracking-widest leading-none">NPPA Benchmark Match</span>
        </div>
      </div>
    </motion.div>
  )
}
