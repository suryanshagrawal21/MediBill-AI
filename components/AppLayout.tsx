"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Dashboard routes that use the sidebar
  const isDashboardRoute = ["/results", "/history", "/legal", "/settings", "/support"].some(
    route => pathname.startsWith(route)
  )

  if (isDashboardRoute) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <main className="p-6 lg:p-10">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </>
  )
}
