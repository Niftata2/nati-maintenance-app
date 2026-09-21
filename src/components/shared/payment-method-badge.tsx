import { cn } from "@/lib/utils"
import type { PaymentMethod } from "../../../domain/types/payment"
import { Banknote, Smartphone, CreditCard, Building2 } from "lucide-react"

interface PaymentMethodBadgeProps {
  method: PaymentMethod
  showIcon?: boolean
}

export function PaymentMethodBadge({ method, showIcon = true }: PaymentMethodBadgeProps) {
    const icons: Record<PaymentMethod, any> = {
        CASH: Banknote,
        TELEBIRR: Smartphone,
        BANK_TRANSFER: Building2,
        CARD: CreditCard,
      }
    
      const labels: Record<PaymentMethod, string> = {
        CASH: "Cash",
        TELEBIRR: "Telebirr",
        BANK_TRANSFER: "Bank Transfer",
        CARD: "Card",
      }
    
      const styles: Record<PaymentMethod, string> = {
        CASH: "bg-emerald-500/10 text-emerald-500",
        TELEBIRR: "bg-purple-500/10 text-purple-500",
        BANK_TRANSFER: "bg-blue-500/10 text-blue-500",
        CARD: "bg-orange-500/10 text-orange-500",
      }

  const Icon = icons[method]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        styles[method]
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {labels[method]}
    </span>
  )
}