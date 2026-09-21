"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutDashboard, Users, Wrench, CreditCard, FileText, Settings, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { name: "Dashboard", href: "/manager", icon: LayoutDashboard, keywords: ["home", "overview", "stats"] },
  { name: "Customers", href: "/manager/customers", icon: Users, keywords: ["clients", "people"] },
  { name: "Jobs", href: "/manager/jobs", icon: Wrench, keywords: ["tasks", "repairs", "devices"] },
  { name: "Payments", href: "/manager/payments", icon: CreditCard, keywords: ["money", "transactions", "cash"] },
  { name: "Reports", href: "/manager/reports", icon: FileText, keywords: ["analytics", "charts", "data"] },
  { name: "Settings", href: "/manager/settings", icon: Settings, keywords: ["config", "profile", "staff"] },
]

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter items based on search
  const filteredItems = navItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.keywords.some(k => k.includes(query.toLowerCase()))
  )

  // Reset selection when query changes
  useEffect(() => { setSelectedIndex(0) }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      // Small timeout to ensure the DOM is ready
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Keyboard navigation (Up/Down/Enter/Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % filteredItems.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        router.push(filteredItems[selectedIndex].href)
        onClose()
      }
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[400px] animate-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground h-12 px-3 text-sm"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No results found.</div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex
              return (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); onClose() }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isSelected ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </div>
                  {isSelected && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}