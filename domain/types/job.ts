// 1. Import the type from dashboard
import type { JobStatusValue as ImportedJobStatusValue } from "./dashboard"

// 2. Re-export it so other files can safely import it from THIS file
export type JobStatusValue = ImportedJobStatusValue

// 3. Define the rest of the job types
export type Job = {
  id: string
  jobNumber: number
  customerName: string
  customerPhone: string
  deviceType: string
  deviceName: string
  reportedProblem: string
  status: JobStatusValue
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  technicianName: string | null
  createdAt: string
  totalCost: number
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID"
}

export type JobActivity = {
  id: string
  timestamp: string
  actorName: string
  action: string
  details?: string
}

export type JobDetail = Job & {
  diagnosis: string | null
  workPerformed: string | null
  activities: JobActivity[]
}