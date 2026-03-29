"use client"

import { motion } from "framer-motion"
import { Settings, User, Bell, Shield, Key, Eye, Moon, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Account Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your security, billing data, and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl bg-primary/10 text-primary font-bold">
            <User className="h-5 w-5" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 text-muted-foreground font-bold font-medium">
            <Shield className="h-5 w-5" /> Privacy
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 text-muted-foreground font-bold font-medium">
            <Bell className="h-5 w-5" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5 text-muted-foreground font-bold font-medium">
            <Key className="h-5 w-5" /> API Keys
          </Button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section className="glass-panel p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              General Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-bold text-white">Interface Theme</p>
                  <p className="text-sm text-muted-foreground font-medium">Switch between light and dark mode</p>
                </div>
                <div className="flex bg-black/40 rounded-lg p-1">
                  <Button size="sm" variant="ghost" className="text-xs h-8 px-4 rounded-md bg-white/10 text-white font-bold">Dark</Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 px-4 rounded-md text-muted-foreground font-bold">Light</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-bold text-white">Benchmarking Data</p>
                  <p className="text-sm text-muted-foreground font-medium">Prefer CGHS 2024 benchmarks</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-lg border-white/10 font-bold">Change</Button>
              </div>
            </div>
          </section>

          <section className="glass-panel p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              AI Config
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <p className="font-bold text-rose-400 mb-1 leading-tight">Gemini API Key Required</p>
                <p className="text-sm text-rose-400/80 font-medium mb-4">You are currently using Demo Mode. Add your API key for real medical bill extraction.</p>
                <input 
                  type="password" 
                  placeholder="Paste GEMINI_API_KEY here..." 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" className="font-bold text-muted-foreground">Cancel</Button>
              <Button className="bg-primary text-primary-foreground font-black px-8 rounded-xl shadow-xl shadow-primary/20">Save Changes</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
