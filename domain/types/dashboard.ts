export type JobStatusValue =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING"
  | "COMPLETED"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED"

export type DashboardSummary = {
  todayRevenue: number
  todayPaymentCount: number
  todayJobs: number
  activeJobs: number
  needsAttentionCount: number
}

export type AttentionItem = {
  id: string
  title: string
  description: string
  severity: "info" | "warning" | "critical"
  href?: string
}

export type RecentJob = {
  id: string
  jobNumber: number
  customerName: string
  deviceName: string
  status: JobStatusValue
  updatedAt: string
}

export type TechnicianActiveJob = {
  jobNumber: number
  deviceName: string
  status: JobStatusValue
}

export type TechnicianActivity = {
  technicianId: string
  technicianName: string
  role: string
  activeJobs: number
  completedToday: number
  activeJobsList: TechnicianActiveJob[]
}

export type RecentActivityItem = {
  id: string
  message: string
  actorName: string
  createdAt: string
}

export type RevenueDataPoint = {
  date: string
  revenue: number
  jobs: number
}

export type JobCategoryData = {
  name: string
  value: number
  color: string
}

export type ManagerDashboardData = {
  summary: DashboardSummary
  attentionItems: AttentionItem[]
  recentJobs: RecentJob[]
  technicianActivity: TechnicianActivity[]
  recentActivity: RecentActivityItem[]
  revenueTrend: RevenueDataPoint[]
  deviceBreakdown: JobCategoryData[]
}