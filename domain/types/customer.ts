import { JobStatusValue } from "./dashboard"

export type Customer = {
    id: string
    name: string
    phone: string
    address?: string
    totalJobs: number
    lastServiceDate: string
    lastServiceDevice: string
  }
  
  export type CustomerJobHistory = {
    id: string
    jobNumber: number
    deviceName: string
    reportedProblem: string
    status: JobStatusValue
    createdAt: string
    totalCost: number
    paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID"
  }
  
  export type CustomerDetail = Customer & {
    jobs: CustomerJobHistory[]
  }