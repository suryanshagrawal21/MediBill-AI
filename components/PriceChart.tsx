"use client"

import { motion } from "framer-motion"

interface PriceChartProps {
  billed: number
  benchmark: number
}

export function PriceChart({ billed, benchmark }: PriceChartProps) {
  const max = Math.max(billed, benchmark)
  const billedHeight = (billed / max) * 100
  const benchmarkHeight = (benchmark / max) * 100

  return (
    <div className="glass-card p-8 rounded-[2.5rem] h-full flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Comparative Analysis</p>
        <h3 className="text-2xl font-black text-white">Price Comparison</h3>
      </div>

      <div className="flex items-end justify-center gap-12 h-48 mt-8">
        {/* Benchmark Bar */}
        <div className="flex flex-col items-center gap-4 group">
          <div className="relative w-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 overflow-hidden h-40">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${benchmarkHeight}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            />
          </div>
          <div className="text-center group-hover:scale-110 transition-transform">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Benchmark</p>
            <p className="text-sm font-black text-white">₹{benchmark.toLocaleString()}</p>
          </div>
        </div>

        {/* Billed Bar */}
        <div className="flex flex-col items-center gap-4 group">
          <div className="relative w-16 bg-rose-500/10 rounded-2xl border border-rose-500/20 overflow-hidden h-40">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${billedHeight}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="absolute bottom-0 w-full bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            />
            {billed > benchmark && (
              <div className="absolute top-0 w-full bg-rose-500/40 h-px animate-pulse" style={{ bottom: `${benchmarkHeight}%` }} />
            )}
          </div>
          <div className="text-center group-hover:scale-110 transition-transform">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Your Bill</p>
            <p className="text-sm font-black text-white">₹{billed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Difference</span>
          </div>
          <span className="text-lg font-black text-rose-500">+₹{(billed - benchmark).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
