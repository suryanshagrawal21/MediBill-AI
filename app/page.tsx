"use client"

import Link from "next/link"
import { Activity, ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#57a6ff] to-[#40b78c] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="container mx-auto px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-primary/40 transition-all">
                AI-Powered Healthcare Billing Audit.{" "}
                <Link href="/analyze" className="font-semibold text-primary">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl mb-6">
              Check Your Hospital Bill for <span className="text-primary">Overcharges</span>
            </h1>
            <p className="text-lg leading-8 text-muted-foreground mb-10">
              Upload your hospital bill and detect overcharging instantly using AI and government rate cards (CGHS & NPPA).
              Generate legal complaint reports and ensure you only pay what is fair.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link
                href="/analyze"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center"
                )}
              >
                Analyze Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Button variant="ghost" size="lg" className="text-lg rounded-full">
                Learn how it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary">Powerful Analysis</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to audit your medical bills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Instant AI Detection",
                description: "Our AI scans line items to find codes and descriptions that don't match market rates.",
                icon: Zap,
              },
              {
                title: "Benchmark Comparison",
                description: "We compare your bill against state and national fair-price benchmarks.",
                icon: BarChart3,
              },
              {
                title: "Legal Reports",
                description: "Generate professional dispute letters and reports for your insurance or hospital.",
                icon: ShieldCheck,
              },
            ].map((feature, i) => (
              <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Built for patients, backed by data</h2>
              <ul className="space-y-4">
                {[
                  "Analyzed over 10,000 hospital bills",
                  "Average savings of $1,200 per user",
                  "Detects up to 60 common medical billing errors",
                  "Generates lawyer-vetted complaint letters",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
                    <span className="text-lg text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
                <div className="h-full w-full bg-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="h-3 w-24 bg-muted rounded" />
                    <div className="h-3 w-12 bg-primary/20 rounded" />
                  </div>
                  <div className="space-y-4">
                    {[60, 40, 80, 50].map((w, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`h-2 bg-${i === 2 ? 'destructive' : 'primary'}/30 rounded flex-1`} style={{ width: `${w}%` }} />
                        <div className="h-4 w-12 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-4 border-t flex justify-between items-center">
                    <span className="text-xl font-bold text-destructive">+$2,430.00</span>
                    <Badge variant="destructive">OVERCHARGE</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
