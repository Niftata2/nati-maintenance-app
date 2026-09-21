import { cn } from "@/lib/utils"
import type { UserRole } from "../../../domain/types/settings"
import { Shield, Wallet, Wrench, Monitor } from "lucide-react"

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const config: Record<UserRole, { label: string; icon: any; className: string }> = {
        MANAGER: { label: "Manager", icon: Shield, className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
        CASHIER: { label: "Cashier", icon: Wallet, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        PHONE_TECHNICIAN: { label: "Phone Tech", icon: Wrench, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
        COMPUTER_TECHNICIAN: { label: "PC Tech", icon: Monitor, className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
      }

  const { label, icon: Icon, className } = config[role]

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}