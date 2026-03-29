"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Upload, 
  History, 
  Scale, 
  ShieldCheck,
  Settings,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { name: "Dashboard", href: "/results", icon: LayoutDashboard },
  { name: "Scan Bill", href: "/upload", icon: Upload },
  { name: "History", href: "/history", icon: History },
  { name: "Legal Notices", href: "/legal", icon: Scale },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/10 bg-background/50 backdrop-blur-xl lg:flex z-40">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          MediBill <span className="text-primary">AI</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
              )} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-10 px-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-4">Support</h4>
          <nav className="space-y-1">
            <Link href="/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all group">
              <Settings className="h-5 w-5 group-hover:text-primary" />
              Settings
            </Link>
            <Link href="/support" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all group">
              <HelpCircle className="h-5 w-5 group-hover:text-primary" />
              Help Center
            </Link>
          </nav>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent">
          <p className="text-xs font-bold text-primary mb-1">PRO PLAN</p>
          <p className="text-[10px] text-muted-foreground mb-3">Get unlimited scans and legal lawyer support.</p>
          <button className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  )
}
