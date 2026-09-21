"use server";

import { prisma } from "@/lib/prisma";
import type { ReportData, DateRange } from "../../domain/types/reports";

function getRangeStart(range: DateRange): Date {
  const now = new Date();
  if (range === "TODAY") {
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (range === "WEEK") {
    now.setDate(now.getDate() - 7);
    return now;
  }
  if (range === "MONTH") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(now.getFullYear(), 0, 1);
}

export async function getReportData(range: DateRange): Promise<ReportData> {
  const start = getRangeStart(range);
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  const [sales, jobs, expenses] = await Promise.all([
    prisma.sale.findMany({
      where: { createdAt: { gte: start } },
      include: { items: true },
    }),
    prisma.job.findMany({
      where: { createdAt: { gte: start } },
      include: { technician: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start } },
    }),
  ]);

  const totalRevenue = sales.reduce((s, x) => s + Number(x.total), 0);
  const totalJobs = jobs.length;

  const completedJobs = jobs.filter((j) => j.status === "COMPLETED" || j.status === "DELIVERED");
  const completionRate = totalJobs > 0 ? (completedJobs.length / totalJobs) * 100 : 0;

  // Avg repair time
  const completedWithTimes = completedJobs.filter((j) => j.startedAt && j.completedAt);
  const avgRepairMs =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce(
          (s, j) =>
            s + (new Date(j.completedAt!).getTime() - new Date(j.startedAt!).getTime()),
          0
        ) / completedWithTimes.length
      : 0;
  const avgRepairTime = avgRepairMs / (1000 * 60 * 60);

  // Revenue trend
  const trendMap: Record<string, { revenue: number; jobs: number }> = {};
  const daysToShow = range === "TODAY" ? 1 : range === "WEEK" ? 7 : range === "MONTH" ? 30 : 12;

  if (range === "YEAR") {
    for (let i = 0; i < 12; i++) {
      const d = new Date(new Date().getFullYear(), i, 1);
      trendMap[d.toISOString().slice(0, 7)] = { revenue: 0, jobs: 0 };
    }
  } else {
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      trendMap[d.toISOString().slice(0, 10)] = { revenue: 0, jobs: 0 };
    }
  }

  sales.forEach((s) => {
    const key =
      range === "YEAR"
        ? new Date(s.createdAt).toISOString().slice(0, 7)
        : new Date(s.createdAt).toISOString().slice(0, 10);
    if (trendMap[key]) trendMap[key].revenue += Number(s.total);
  });
  jobs.forEach((j) => {
    const key =
      range === "YEAR"
        ? new Date(j.createdAt).toISOString().slice(0, 7)
        : new Date(j.createdAt).toISOString().slice(0, 10);
    if (trendMap[key]) trendMap[key].jobs += 1;
  });

  const revenueTrend = Object.entries(trendMap).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    jobs: v.jobs,
  }));

  // Device breakdown
  const deviceMap: Record<string, number> = {};
  jobs.forEach((j) => {
    deviceMap[j.deviceType] = (deviceMap[j.deviceType] || 0) + 1;
  });
  const deviceBreakdown = Object.entries(deviceMap).map(([name, value], i) => ({
    name,
    value,
    color: colors[i % colors.length],
  }));

  // Technician performance
  const techMap: Record<string, { name: string; completed: number; revenue: number }> = {};
  jobs.forEach((j) => {
    if (!j.technician) return;
    if (!techMap[j.technicianId!]) {
      techMap[j.technicianId!] = { name: j.technician.name, completed: 0, revenue: 0 };
    }
    if (j.status === "COMPLETED" || j.status === "DELIVERED") {
      techMap[j.technicianId!].completed += 1;
      techMap[j.technicianId!].revenue += Number(j.total);
    }
  });
  const technicianPerformance = Object.values(techMap).sort((a, b) => b.completed - a.completed);

  // Top jobs
  const topJobsRaw = await prisma.job.findMany({
    where: { createdAt: { gte: start }, total: { gt: 0 } },
    include: { customer: true },
    orderBy: { total: "desc" },
    take: 5,
  });
  const topJobs = topJobsRaw.map((j) => ({
    id: j.id,
    jobNumber: parseInt(j.jobNumber.replace(/^JOB-?/, "")) || 0,
    customer: j.customer.name,
    device: `${j.deviceType} ${j.deviceModel || ""}`.trim(),
    revenue: Number(j.total),
    status: j.status,
  }));

  return {
    summary: {
      totalRevenue,
      totalJobs,
      avgRepairTime,
      completionRate,
    },
    revenueTrend,
    deviceBreakdown,
    technicianPerformance,
    topJobs,
  };
}