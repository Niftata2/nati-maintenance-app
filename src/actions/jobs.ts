"use server"

import type { Job, JobDetail, JobStatusValue } from "../../domain/types/job"

// TEMPORARY MOCK DATA — Backend will replace with Prisma
const MOCK_JOBS: Job[] = [
  {
    id: "j1042", jobNumber: 1042, customerName: "Fikru Alemu", customerPhone: "+251 911 234 567",
    deviceType: "Phone", deviceName: "iPhone 12", reportedProblem: "Screen cracked, touch not responding",
    status: "IN_PROGRESS", priority: "HIGH", technicianName: "Dawit A.", createdAt: "2 days ago",
    totalCost: 4500, paymentStatus: "UNPAID"
  },
  {
    id: "j1041", jobNumber: 1041, customerName: "Bethelhem T.", customerPhone: "+251 922 345 678",
    deviceType: "Computer", deviceName: "Dell Latitude", reportedProblem: "Won't turn on, possible motherboard issue",
    status: "WAITING", priority: "MEDIUM", technicianName: "Selam G.", createdAt: "1 week ago",
    totalCost: 0, paymentStatus: "UNPAID"
  },
  {
    id: "j1040", jobNumber: 1040, customerName: "Kebede W.", customerPhone: "+251 933 456 789",
    deviceType: "Phone", deviceName: "Samsung A14", reportedProblem: "Charging port loose",
    status: "COMPLETED", priority: "LOW", technicianName: "Yonas B.", createdAt: "3 days ago",
    totalCost: 800, paymentStatus: "PAID"
  },
  {
    id: "j1039", jobNumber: 1039, customerName: "Hanna M.", customerPhone: "+251 944 567 890",
    deviceType: "Computer", deviceName: "HP Pavilion", reportedProblem: "Slow performance, needs SSD upgrade",
    status: "READY_FOR_PICKUP", priority: "MEDIUM", technicianName: "Selam G.", createdAt: "5 days ago",
    totalCost: 3200, paymentStatus: "PARTIALLY_PAID"
  }
]

const MOCK_JOB_DETAILS: Record<string, JobDetail> = {
  "j1042": {
    ...MOCK_JOBS[0],
    diagnosis: "LCD and digitizer assembly are damaged. Requires full screen replacement.",
    workPerformed: "Ordered replacement screen. Awaiting parts delivery.",
    activities: [
      { id: "a1", timestamp: "2 days ago", actorName: "Meron K. (Cashier)", action: "Job created", details: "Initial intake" },
      { id: "a2", timestamp: "1 day ago", actorName: "Dawit A.", action: "Diagnosis recorded", details: "Screen replacement required" },
      { id: "a3", timestamp: "12 hours ago", actorName: "Dawit A.", action: "Status changed", details: "Moved to IN_PROGRESS" }
    ]
  },
  "j1041": {
    ...MOCK_JOBS[1],
    diagnosis: "Motherboard short circuit suspected. Requires multimeter testing.",
    workPerformed: null,
    activities: [
      { id: "a4", timestamp: "1 week ago", actorName: "Meron K. (Cashier)", action: "Job created" },
      { id: "a5", timestamp: "6 days ago", actorName: "Selam G.", action: "Assigned to technician" },
      { id: "a6", timestamp: "5 days ago", actorName: "Selam G.", action: "Status changed", details: "Moved to WAITING for parts/tools" }
    ]
  }
}

export async function getJobs(statusFilter?: JobStatusValue | "ALL", searchQuery?: string): Promise<Job[]> {  // TODO: Backend will implement Prisma filtering
  let filtered = MOCK_JOBS
  if (statusFilter && statusFilter !== "ALL") {
    filtered = filtered.filter(j => j.status === statusFilter)
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(j => 
      j.customerName.toLowerCase().includes(q) || 
      String(j.jobNumber).includes(q) ||
      j.deviceName.toLowerCase().includes(q)
    )
  }
  return filtered
}

export async function getJobDetail(id: string): Promise<JobDetail | null> {
  // TODO: Backend will implement Prisma: db.job.findUnique({ where: { id }, include: { activities: true } })
  return MOCK_JOB_DETAILS[id] || null
}