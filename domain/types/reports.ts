export type DateRange = "TODAY" | "WEEK" | "MONTH" | "YEAR"

export type DeviceBreakdown = {
  name: string
  value: number
  color: string
}

export type TechnicianPerformance = {
  name: string
  completed: number
  revenue: number
}

export type ReportSummary = {
  totalRevenue: number
  totalJobs: number
  avgRepairTime: number // in hours
  completionRate: number // percentage
}

export type RevenueDataPoint = {
  date: string
  revenue: number
  jobs: number // 
}

export type TopJob = {
  id: string
  jobNumber: number
  customer: string
  device: string
  revenue: number
  status: string
}

export type ReportData = {
  summary: ReportSummary
  revenueTrend: RevenueDataPoint[]
  deviceBreakdown: DeviceBreakdown[]
  technicianPerformance: TechnicianPerformance[]
  topJobs: TopJob[]
}