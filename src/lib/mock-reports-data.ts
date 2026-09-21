import type { ReportData, DateRange } from "../../domain/types/reports"

const generateData = (range: DateRange): ReportData => {
  // In a real app, this would query the database based on the date range
  const multiplier = range === "TODAY" ? 1 : range === "WEEK" ? 7 : range === "MONTH" ? 30 : 365;
  
  return {
    summary: {
      totalRevenue: 45600 * (range === "TODAY" ? 0.2 : 1),
      totalJobs: Math.floor(14 * (range === "TODAY" ? 0.5 : 1)),
      avgRepairTime: 4.5,
      completionRate: 92,
    },
    revenueTrend: Array.from({ length: range === "TODAY" ? 12 : 7 }, (_, i) => ({
      date: range === "TODAY" ? `${i * 2}h` : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      revenue: Math.floor(Math.random() * 5000) + 2000,
      jobs: Math.floor(Math.random() * 10) + 1, // <-- ADDED THIS LINE
    })),
    deviceBreakdown: [
      { name: "Phones", value: 65, color: "#10b981" },
      { name: "Computers", value: 25, color: "#3b82f6" },
      { name: "Tablets", value: 10, color: "#f59e0b" },
    ],
    technicianPerformance: [
      { name: "Dawit A.", completed: 42, revenue: 125000 },
      { name: "Selam G.", completed: 38, revenue: 110000 },
      { name: "Yonas B.", completed: 35, revenue: 95000 },
      { name: "Meron K.", completed: 20, revenue: 45000 },
    ],
    topJobs: [
      { id: "1", jobNumber: 1042, customer: "Fikru Alemu", device: "iPhone 12 Pro Max", revenue: 8500, status: "COMPLETED" },
      { id: "2", jobNumber: 1039, customer: "Hanna M.", device: "MacBook Pro M1", revenue: 12000, status: "COMPLETED" },
      { id: "3", jobNumber: 1035, customer: "Dawit A.", device: "Dell XPS 15", revenue: 6500, status: "COMPLETED" },
    ]
  }
}

export async function getReportData(range: DateRange): Promise<ReportData> {
  return generateData(range)
}