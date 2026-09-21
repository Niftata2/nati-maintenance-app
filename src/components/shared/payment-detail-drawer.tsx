"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge"
import { PaymentMethodBadge } from "@/components/shared/payment-method-badge"
import type { PaymentDetail } from "../../../domain/types/payment"
import { useRouter } from "next/navigation"
import { FileText, User, Wrench, CheckCircle2 } from "lucide-react"

interface PaymentDetailDrawerProps {
  payment: PaymentDetail | null
  isOpen: boolean
}

export function PaymentDetailDrawer({ payment, isOpen }: PaymentDetailDrawerProps) {
  const router = useRouter()
  const handleClose = () => router.push("/manager/payments")
  if (!payment) return null

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:w-[480px] border-l border-border bg-background text-foreground h-full overflow-y-auto p-6">
  <div className="animate-page-enter"> 
    <SheetHeader className="mb-6 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-500" /> Receipt #{payment.paymentNumber}</SheetTitle>
              <SheetDescription className="text-muted-foreground text-sm mt-1">Recorded on {payment.paidAt}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-muted/50 p-6 text-center">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Amount Collected</div>
            <div className="text-4xl font-bold text-foreground mb-3">{payment.amount.toLocaleString()} <span className="text-lg text-muted-foreground">ETB</span></div>
            <div className="flex justify-center gap-3">
              <PaymentStatusBadge status={payment.paymentStatus} />
              <PaymentMethodBadge method={payment.paymentMethod} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2"><Wrench className="h-3 w-3" /> Related Job</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-foreground">Job #{payment.jobNumber}</div>
                  <div className="text-sm text-muted-foreground mt-1">{payment.jobDetails.deviceName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total Cost</div>
                  <div className="font-semibold text-foreground">{payment.jobDetails.totalCost.toLocaleString()} ETB</div>
                </div>
              </div>
              {payment.jobDetails.remainingBalance > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 text-sm">
                  <span className="text-muted-foreground">Remaining Balance: </span>
                  <span className="font-bold text-amber-500">{payment.jobDetails.remainingBalance.toLocaleString()} ETB</span>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2"><User className="h-3 w-3" /> Customer & Staff</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Customer</span><span className="font-medium text-foreground">{payment.customerName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Recorded By</span><span className="font-medium text-foreground">{payment.recordedBy}</span></div>
              </div>
            </div>
          </div>
          {payment.notes && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Notes</div>
              <p className="text-sm text-foreground/80">{payment.notes}</p>
            </div>
          )}
          <button className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 flex items-center justify-center gap-2 transition-colors">
            <CheckCircle2 className="h-4 w-4" /> Print Receipt
          </button>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}