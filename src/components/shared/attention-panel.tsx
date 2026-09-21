"use client"

import { useState } from "react"
import type { AttentionItem } from "../../../domain/types/dashboard"
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttentionPanelProps {
  items: AttentionItem[]
}

export function AttentionPanel({ items }: AttentionPanelProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBorderColor = (severity: string, isOpen: boolean) => {
    if (!isOpen) return "border-white/5"
    switch (severity) {
      case "critical": return "border-red-500/30 bg-red-500/5"
      case "warning": return "border-amber-500/30 bg-amber-500/5"
      default: return "border-blue-500/30 bg-blue-500/5"
    }
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className="rounded-lg border transition-all duration-200" style={{ borderColor: isOpen ? undefined : undefined }}>
            {/* Clickable Header */}
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className={cn(
                "flex w-full items-center justify-between p-4 text-left transition-colors",
                isOpen ? getBorderColor(item.severity, true) : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                {getIcon(item.severity)}
                <div>
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{item.description}</div>
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>

            {/* Expanded Content */}
            {isOpen && (
              <div className="border-t border-white/5 p-4 pl-12 bg-black/20">
                <div className="text-sm text-zinc-300 mb-3">
                  Detailed view for: <span className="font-medium text-white">{item.title}</span>
                </div>
                
                {/* Mock Details - In V1 this would list the specific jobs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 bg-white/5 p-2 rounded">
                    <span>Job #1042 - iPhone 12 (Waiting 26h)</span>
                    <span className="text-amber-500">Action Required</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 bg-white/5 p-2 rounded">
                    <span>Job #1041 - Dell Latitude (Waiting 24h)</span>
                    <span className="text-amber-500">Action Required</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                    View All Related Jobs →
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}