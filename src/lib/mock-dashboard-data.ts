import type { ManagerDashboardData } from "../../domain/types/dashboard"

export async function getManagerDashboardData(): Promise<ManagerDashboardData> {
  return {
    summary: {
      todayRevenue: 8450,
      todayPaymentCount: 12,
      todayJobs: 14,
      activeJobs: 5,
      needsAttentionCount: 3,
    },
    attentionItems: [
      { id: "att1", title: "3 jobs waiting more than 24 hours", description: "Long-running jobs", severity: "warning" },
      { id: "att2", title: "2 jobs have no technician assigned", description: "Need technician assignment", severity: "critical" },
      { id: "att3", title: "1 completed job has an unpaid balance", description: "Payment required", severity: "warning" },
    ],
    recentJobs: [
      { id: "j1", jobNumber: 1042, customerName: "Fikru Alemu", deviceName: "iPhone 12", status: "IN_PROGRESS", updatedAt: "10 min ago" },
      { id: "j2", jobNumber: 1041, customerName: "Bethelhem T.", deviceName: "Dell Latitude", status: "WAITING", updatedAt: "35 min ago" },
      { id: "j3", jobNumber: 1040, customerName: "Kebede W.", deviceName: "Samsung A14", status: "COMPLETED", updatedAt: "1 hr ago" },
    ],
    technicianActivity: [
      {
        technicianId: "t1", technicianName: "Dawit A.", role: "Phone Technician", activeJobs: 3, completedToday: 2,
        activeJobsList: [
          { jobNumber: 1042, deviceName: "iPhone 12", status: "IN_PROGRESS" },
        ],
      },
    ],
    recentActivity: [
      { id: "a1", message: "Job #1042 moved to In Progress", actorName: "Dawit A.", createdAt: "10 min ago" },
    ],
    revenueTrend: [
      { date: "Mon", revenue: 4200, jobs: 5 },
      { date: "Tue", revenue: 3800, jobs: 4 },
    ],
    deviceBreakdown: [
      { name: "Phones", value: 65, color: "#10b981" },
      { name: "Computers", value: 25, color: "#3b82f6" },
    ],
  }
}