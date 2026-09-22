"use server";

import { prisma } from "@/lib/prisma";
import type { Job, JobDetail, JobStatusValue, JobActivity } from "../../domain/types/job";

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function mapStatus(status: string): JobStatusValue {
  const map: Record<string, JobStatusValue> = {
    PENDING: "NEW",
    ASSIGNED: "ASSIGNED",
    IN_PROGRESS: "IN_PROGRESS",
    WAITING_FOR_PARTS: "WAITING",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    COMPLETED: "COMPLETED",
    DELIVERED: "DELIVERED",
    NOT_REPAIRABLE: "CANCELLED",
    CANCELLED: "CANCELLED",
  };
  return map[status] || "NEW";
}

function deviceLabel(type: string, model: string | null): string {
  return `${type} ${model || ""}`.trim();
}

export async function getJobs(
  statusFilter?: JobStatusValue | "ALL",
  searchQuery?: string
): Promise<Job[]> {
  const where: any = {};

  if (statusFilter && statusFilter !== "ALL") {
    const reverseMap: Record<JobStatusValue, string[]> = {
      NEW: ["PENDING"],
      ASSIGNED: ["ASSIGNED"],
      IN_PROGRESS: ["IN_PROGRESS"],
      WAITING: ["WAITING_FOR_PARTS"],
      READY_FOR_PICKUP: ["READY_FOR_PICKUP"],
      COMPLETED: ["COMPLETED"],
      DELIVERED: ["DELIVERED"],
      CANCELLED: ["CANCELLED", "NOT_REPAIRABLE"],
    };
    where.status = { in: reverseMap[statusFilter] || [] };
  }

  if (searchQuery) {
    const q = searchQuery;
    where.OR = [
      { jobNumber: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
      { deviceType: { contains: q, mode: "insensitive" } },
      { deviceModel: { contains: q, mode: "insensitive" } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      customer: true,
      technician: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return jobs.map((j) => ({
    id: j.id,
    jobNumber: parseInt(j.jobNumber.replace(/^JOB-?/, "")) || 0,
    customerName: j.customer.name,
    customerPhone: j.customer.phone || "—",
    deviceType: j.deviceType,
    deviceName: deviceLabel(j.deviceType, j.deviceModel),
    reportedProblem: j.problem,
    status: mapStatus(j.status),
    priority: j.priority as any,
    technicianName: j.technician?.name || null,
    createdAt: timeAgo(j.createdAt),
    totalCost: Number(j.total),
    paymentStatus: j.paymentStatus as any,
  }));
}

export async function getJobDetail(id: string): Promise<JobDetail | null> {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      technician: { select: { name: true } },
      createdBy: { select: { name: true } },
      items: true,
    },
  });

  if (!job) return null;

  // Build a timeline from timestamps we have
  const activities: JobActivity[] = [];

  activities.push({
    id: `created-${job.id}`,
    timestamp: timeAgo(job.createdAt),
    actorName: job.createdBy?.name || "System",
    action: "Job created",
    details: `Intake for ${deviceLabel(job.deviceType, job.deviceModel)}`,
  });

  if (job.technician && job.status !== "PENDING") {
    activities.push({
      id: `assigned-${job.id}`,
      timestamp: timeAgo(job.updatedAt),
      actorName: job.createdBy?.name || "System",
      action: "Assigned to technician",
      details: job.technician.name,
    });
  }

  if (job.startedAt) {
    activities.push({
      id: `started-${job.id}`,
      timestamp: timeAgo(job.startedAt),
      actorName: job.technician?.name || "Technician",
      action: "Work started",
      details: "Status moved to IN_PROGRESS",
    });
  }

  if (job.completedAt) {
    activities.push({
      id: `completed-${job.id}`,
      timestamp: timeAgo(job.completedAt),
      actorName: job.technician?.name || "Technician",
      action: job.status === "NOT_REPAIRABLE" ? "Marked not repairable" : "Work completed",
    });
  }

  if (job.diagnosis) {
    activities.push({
      id: `diagnosis-${job.id}`,
      timestamp: timeAgo(job.updatedAt),
      actorName: job.technician?.name || "Technician",
      action: "Diagnosis recorded",
      details: job.diagnosis.slice(0, 100),
    });
  }

  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    id: job.id,
    jobNumber: parseInt(j.jobNumber.replace(/^JOB-?/, "")) || 0,
    customerName: job.customer.name,
    customerPhone: job.customer.phone || "—",
    deviceType: job.deviceType,
    deviceName: deviceLabel(job.deviceType, job.deviceModel),
    reportedProblem: job.problem,
    status: mapStatus(job.status),
    priority: job.priority as any,
    technicianName: job.technician?.name || null,
    createdAt: timeAgo(job.createdAt),
    totalCost: Number(job.total),
    paymentStatus: job.paymentStatus as any,
    diagnosis: job.diagnosis || null,
    workPerformed: null,
    activities,
  };
}