export type PaymentMethod = "CASH" | "TELEBIRR" | "BANK_TRANSFER" | "CARD"
export type PaymentStatus = "PAID" | "PARTIALLY_PAID" | "PENDING"

export type Payment = {
  id: string
  paymentNumber: number
  jobId: string
  jobNumber: number
  customerName: string
  amount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paidAt: string
  recordedBy: string
  notes?: string
}

export type PaymentSummary = {
  totalRevenue: number
  pendingPayments: number
  overduePayments: number
  averageTicketSize: number
  todayCollections: number
  paymentMethodBreakdown: {
    cash: number
    telebirr: number
    bankTransfer: number
    card: number
  }
}

export type PaymentDetail = Payment & {
  jobDetails: {
    deviceName: string
    reportedProblem: string
    totalCost: number
    remainingBalance: number
  }
}