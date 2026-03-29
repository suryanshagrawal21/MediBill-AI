"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, FileText, Menu, X, Upload, TrendingUp, ShieldCheck } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/mode-toggle"

const navItems = [
  { name: "Home", href: "/", icon: Activity },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Dashboard", href: "/results", icon: LayoutDashboard },
  { name: "History", href: "/history", icon: TrendingUp },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              MediBill <span className="text-primary font-extrabold">AI</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-all hover:text-primary",
                pathname === item.href ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          <ModeToggle />
          <Link 
            href="/upload" 
            className={cn(
              buttonVariants({ size: "default" }),
              "ml-2 rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            )}
          >
            <Upload className="h-4 w-4" />
            Scan Bill
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="border-b bg-background p-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href ? "bg-black/10 dark:bg-white/10 text-black dark:text-white font-bold" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Link 
              href="/upload" 
              onClick={() => setIsOpen(false)}
              className={cn(buttonVariants(), "w-full rounded-xl bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black")}
            >
              Upload Bill
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
