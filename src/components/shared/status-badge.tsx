import { cn } from "@/lib/utils"
import type { JobStatusValue } from "../../../domain/types/dashboard"

interface StatusBadgeProps {
  status: JobStatusValue
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<JobStatusValue, string> = {
    NEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ASSIGNED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    IN_PROGRESS: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    WAITING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    READY_FOR_PICKUP: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    DELIVERED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const labels: Record<JobStatusValue, string> = {
    NEW: "New",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    WAITING: "Waiting",
    COMPLETED: "Completed",
    READY_FOR_PICKUP: "Ready",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {/* Pulsing dot for active statuses */}
      {(status === "IN_PROGRESS" || status === "NEW") && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {labels[status]}
    </span>
  )
}