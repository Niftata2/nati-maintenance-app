import { cn } from "@/lib/utils"
import type { PaymentStatus } from "../../../domain/types/payment"

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const styles: Record<PaymentStatus, string> = {
        PAID: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        PARTIALLY_PAID: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        PENDING: "bg-red-500/10 text-red-500 border-red-500/20",
      }
    
      const labels: Record<PaymentStatus, string> = {
        PAID: "Paid",
        PARTIALLY_PAID: "Partial",
        PENDING: "Pending",
      }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  )
}