"use client"

import Link from "next/link"
import { motion, Variants } from "framer-motion"
import {
  Camera, BarChart3, AlertTriangle, FileText, ArrowRight,
  ShieldCheck, Zap, Scale, Check, Star, Users, TrendingDown,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const features = [
    {
      title: "OCR Bill Scanning",
      description: "AI instantly extracts every line item, charges, and details from any PDF or image.",
      icon: Camera,
      color: "text-black dark:text-white",
      bg: "bg-neutral-200/50 dark:bg-neutral-800/50",
    },
    {
      title: "Benchmark Comparison",
      description: "Every charge is cross-referenced against official CGHS and NPPA benchmark rates.",
      icon: BarChart3,
      color: "text-black dark:text-white",
      bg: "bg-neutral-200/50 dark:bg-neutral-800/50",
    },
    {
      title: "Overcharge Detection",
      description: "Overpriced items, duplicate charges, and billing errors are flagged automatically.",
      icon: AlertTriangle,
      color: "text-black dark:text-white",
      bg: "bg-neutral-200/50 dark:bg-neutral-800/50",
    },
    {
      title: "Legal Notice Generator",
      description: "Auto-generate a formal legal complaint letter, ready to send to the hospital.",
      icon: Scale,
      color: "text-black dark:text-white",
      bg: "bg-neutral-200/50 dark:bg-neutral-800/50",
    },
  ]


  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } }
  }

  const stagger: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/30">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-24 lg:pt-36 lg:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md text-primary text-sm font-bold mb-6">
              <ShieldCheck className="w-4 h-4" />
              India's Most Trusted Medical Bill Auditor
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]"
          >
            Protect Your Wealth With <br />
            <span className="text-gradient">MediBill AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Stop hospital overcharging in its tracks. Our AI instantly audits your bills against government benchmarks and prepares your legal defense in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/upload"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-16 px-12 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 flex items-center gap-3 group w-full sm:w-auto"
              )}
            >
              <Camera className="h-5 w-5" />
              Audit My Bill Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-16 px-12 rounded-2xl text-lg font-bold border-white/10 hover:bg-white/5 transition-all w-full sm:w-auto"
              )}
            >
              Learn More
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-white">45%</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg. Overcharge Found</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-white">100+</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hospitals Audited</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-white">₹2Cr+</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Savings Identified</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-white">10k+</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bills Scanned</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center justify-center gap-2 mb-4">
              <Zap className="h-4 w-4" /> Full Protection Suite
            </h2>
            <p className="text-4xl md:text-5xl font-black tracking-tight text-white">How MediBill Protects You</p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feat, i) => (
              <motion.div key={i} variants={cardVariants}>
                <div className="glass-card h-full p-8 rounded-3xl relative group hover:border-primary/50 transition-all duration-500">
                  <div className="absolute top-6 right-8 text-6xl font-black text-white/5 group-hover:text-primary/10 transition-colors">{i + 1}</div>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <feat.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">{feat.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2rem] overflow-hidden border border-white/10 p-12 lg:p-20 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10 -z-10" />
            <div className="max-w-3xl mx-auto">
              <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white leading-tight">
                Stop Being a Victim of <br /> Hospital Billing Errors.
              </h3>
              <p className="text-muted-foreground text-lg mb-10 font-medium">
                Join thousands of Indians who have successfully challenged overcharged medical bills using MediBill AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/upload"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-2xl h-16 px-12 bg-white text-black hover:bg-neutral-200 font-black text-lg transition-all active:scale-95"
                  )}
                >
                  Start Your Free Audit
                </Link>
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background overflow-hidden bg-muted">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                  <span className="ml-4 text-xs font-bold text-muted-foreground italic">Joined by 10k+ users this month</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
