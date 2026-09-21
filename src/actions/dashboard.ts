"use server";

import { prisma } from "@/lib/prisma";
import type { ManagerDashboardData, JobStatusValue } from "../../domain/types/dashboard";

function mapStatus(status: string): JobStatusValue {
  const map: Record<string, JobStatusValue> = {
    PENDING: "NEW",
    ASSIGNED: "ASSIGNED",
    IN_PROGRESS: "IN_PROGRESS",
    WAITING_FOR_PARTS: "WAITING",
    COMPLETED: "COMPLETED",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    DELIVERED: "DELIVERED",
    NOT_REPAIRABLE: "CANCELLED",
    CANCELLED: "CANCELLED",
  };
  return map[status] || "NEW";
}

export async function getManagerDashboardData(): Promise<ManagerDashboardData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Today's revenue + payment count
  const todayPayments = await prisma.payment.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { amount: true },
    _count: true,
  });

  const todayJobsCount = await prisma.job.count({
    where: { createdAt: { gte: today } },
  });

  const activeJobsCount = await prisma.job.count({
    where: {
      status: { in: ["ASSIGNED", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_PICKUP"] },
    },
  });

  // Needs attention: no technician + overdue + unpaid completed
  const noTechJobs = await prisma.job.count({
    where: { technicianId: null, status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED", "NOT_REPAIRABLE"] } },
  });
  const overdueJobs = await prisma.job.count({
    where: {
      status: { in: ["ASSIGNED", "IN_PROGRESS", "WAITING_FOR_PARTS"] },
      createdAt: { lt: yesterday },
    },
  });
  const unpaidCompleted = await prisma.job.count({
    where: { status: "COMPLETED", paymentStatus: { not: "PAID" } },
  });

  const attentionItems = [];
  if (noTechJobs > 0) {
    attentionItems.push({
      id: "no-tech",
      title: `${noTechJobs} job${noTechJobs > 1 ? "s" : ""} without technician`,
      description: "Assign a technician to continue",
      severity: "critical" as const,
      href: "/manager/jobs",
    });
  }
  if (overdueJobs > 0) {
    attentionItems.push({
      id: "overdue",
      title: `${overdueJobs} job${overdueJobs > 1 ? "s" : ""} running late`,
      description: "Waiting more than 24 hours",
      severity: "warning" as const,
      href: "/manager/jobs",
    });
  }
  if (unpaidCompleted > 0) {
    attentionItems.push({
      id: "unpaid",
      title: `${unpaidCompleted} completed job${unpaidCompleted > 1 ? "s" : ""} unpaid`,
      description: "Payment required",
      severity: "warning" as const,
      href: "/manager/payments",
    });
  }

  // Recent jobs
  const recentJobsRaw = await prisma.job.findMany({
    include: { customer: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const recentJobs = recentJobsRaw.map((j) => ({
    id: j.id,
    jobNumber: parseInt(j.jobNumber.replace(/^JOB-?/, "")) || 0,
    customerName: j.customer.name,
    deviceName: `${j.deviceType} ${j.deviceModel || ""}`.trim(),
    status: mapStatus(j.status),
    updatedAt: j.updatedAt.toISOString(),
  }));

  // Technician activity
  const technicians = await prisma.user.findMany({
    where: { role: "TECHNICIAN", isActive: true },
    include: {
      technicianJobs: {
        select: { jobNumber: true, deviceType: true, deviceModel: true, status: true, updatedAt: true },
      },
    },
    take: 10,
  });

  const technicianActivity = technicians.map((t) => {
    const active = t.technicianJobs.filter((j) =>
      ["ASSIGNED", "IN_PROGRESS", "WAITING_FOR_PARTS", "READY_FOR_PICKUP"].includes(j.status)
    );
    const completedToday = t.technicianJobs.filter(
      (j) => j.status === "COMPLETED" && new Date(j.updatedAt) >= today
    ).length;
    return {
      technicianId: t.id,
      technicianName: t.name,
      role: "TECHNICIAN",
      activeJobs: active.length,
      completedToday,
      activeJobsList: active.slice(0, 3).map((j) => ({
        jobNumber: parseInt(j.jobNumber.replace(/^JOB-?/, "")) || 0,
        deviceName: `${j.deviceType} ${j.deviceModel || ""}`.trim(),
        status: mapStatus(j.status),
      })),
    };
  });

  // Recent activity
  const recentActivityRaw = await prisma.job.findMany({
    include: { technician: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const recentActivity = recentActivityRaw.map((j) => ({
    id: j.id,
    message: `Job #${j.jobNumber.replace(/^JOB-?/, "")} moved to ${mapStatus(j.status)}`,
    actorName: j.technician?.name || "Unassigned",
    createdAt: j.updatedAt.toISOString(),
  }));

  // Revenue trend (last 14 days)
  const salesLast14 = await prisma.sale.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true, total: true },
  });
  const jobsLast14 = await prisma.job.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true },
  });

  const trendMap: Record<string, { revenue: number; jobs: number }> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trendMap[key] = { revenue: 0, jobs: 0 };
  }
  salesLast14.forEach((s) => {
    const key = new Date(s.createdAt).toISOString().slice(0, 10);
    if (trendMap[key]) trendMap[key].revenue += Number(s.total);
  });
  jobsLast14.forEach((j) => {
    const key = new Date(j.createdAt).toISOString().slice(0, 10);
    if (trendMap[key]) trendMap[key].jobs += 1;
  });

  const revenueTrend = Object.entries(trendMap).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    jobs: v.jobs,
  }));

  // Device breakdown
  const deviceCounts = await prisma.job.groupBy({
    by: ["deviceType"],
    _count: true,
  });
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
  const deviceBreakdown = deviceCounts.map((d, i) => ({
    name: d.deviceType,
    value: d._count,
    color: colors[i % colors.length],
  }));

  return {
    summary: {
      todayRevenue: Number(todayPayments._sum.amount || 0),
      todayPaymentCount: todayPayments._count,
      todayJobs: todayJobsCount,
      activeJobs: activeJobsCount,
      needsAttentionCount: attentionItems.length,
    },
    attentionItems,
    recentJobs,
    technicianActivity,
    recentActivity,
    revenueTrend,
    deviceBreakdown,
  };
}