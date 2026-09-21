import type { Payment, PaymentSummary, PaymentDetail } from "../../domain/types/payment"

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "p1",
    paymentNumber: 2401,
    jobId: "j1042",
    jobNumber: 1042,
    customerName: "Fikru Alemu",
    amount: 4500,
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    paidAt: "2024-09-15 14:30",
    recordedBy: "Meron K.",
  },
  {
    id: "p2",
    paymentNumber: 2402,
    jobId: "j1040",
    jobNumber: 1040,
    customerName: "Kebede W.",
    amount: 800,
    paymentMethod: "TELEBIRR",
    paymentStatus: "PAID",
    paidAt: "2024-09-15 11:20",
    recordedBy: "Meron K.",
  },
  {
    id: "p3",
    paymentNumber: 2403,
    jobId: "j1039",
    jobNumber: 1039,
    customerName: "Hanna M.",
    amount: 2000,
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "PARTIALLY_PAID",
    paidAt: "2024-09-14 16:45",
    recordedBy: "Meron K.",
    notes: "Partial payment - 1200 ETB remaining",
  },
  {
    id: "p4",
    paymentNumber: 2404,
    jobId: "j1038",
    jobNumber: 1038,
    customerName: "Robel S.",
    amount: 1500,
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    paidAt: "2024-09-13 10:00",
    recordedBy: "Meron K.",
  },
  {
    id: "p5",
    paymentNumber: 2405,
    jobId: "j1035",
    jobNumber: 1035,
    customerName: "Dawit A.",
    amount: 3200,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    paidAt: "2024-09-12 15:30",
    recordedBy: "Meron K.",
  },
]

export const MOCK_PAYMENT_SUMMARY: PaymentSummary = {
  totalRevenue: 45600,
  pendingPayments: 3,
  overduePayments: 1,
  averageTicketSize: 2150,
  todayCollections: 8450,
  paymentMethodBreakdown: {
    cash: 28400,
    telebirr: 12200,
    bankTransfer: 3500,
    card: 1500,
  },
}

export const MOCK_PAYMENT_DETAILS: Record<string, PaymentDetail> = {
  "p1": {
    ...MOCK_PAYMENTS[0],
    jobDetails: {
      deviceName: "iPhone 12",
      reportedProblem: "Screen cracked, touch not responding",
      totalCost: 4500,
      remainingBalance: 0,
    },
  },
  "p3": {
    ...MOCK_PAYMENTS[2],
    jobDetails: {
      deviceName: "HP Pavilion",
      reportedProblem: "Slow performance, needs SSD upgrade",
      totalCost: 3200,
      remainingBalance: 1200,
    },
  },
}

export async function getPayments(
  statusFilter?: string,
  searchQuery?: string
): Promise<Payment[]> {
  // TODO: Backend will implement Prisma filtering
  let filtered = MOCK_PAYMENTS
  
  if (statusFilter && statusFilter !== "ALL") {
    filtered = filtered.filter(p => p.paymentStatus === statusFilter)
  }
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.customerName.toLowerCase().includes(q) ||
      String(p.paymentNumber).includes(q) ||
      String(p.jobNumber).includes(q)
    )
  }
  
  return filtered
}

export async function getPaymentSummary(): Promise<PaymentSummary> {
  // TODO: Backend will implement Prisma aggregates
  return MOCK_PAYMENT_SUMMARY
}

export async function getPaymentDetail(id: string): Promise<PaymentDetail | null> {
  // TODO: Backend will implement Prisma query
  return MOCK_PAYMENT_DETAILS[id] || null
}