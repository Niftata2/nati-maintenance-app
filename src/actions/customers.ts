"use server";

import { prisma } from "@/lib/prisma";
import type { Customer, CustomerDetail } from "../../domain/types/customer";

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
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

function mapJobStatus(status: string): string {
  const map: Record<string, string> = {
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

export async function getCustomers(searchQuery?: string): Promise<Customer[]> {
  const where: any = {};
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { phone: { contains: searchQuery } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      jobs: {
        select: { deviceType: true, deviceModel: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { jobs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((c) => {
    const lastJob = c.jobs[0];
    return {
      id: c.id,
      name: c.name,
      phone: c.phone || "—",
      totalJobs: c._count.jobs,
      lastServiceDate: lastJob ? timeAgo(lastJob.createdAt) : "Never",
      lastServiceDevice: lastJob
        ? `${lastJob.deviceType} ${lastJob.deviceModel || ""}`.trim()
        : "—",
    };
  });
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      jobs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) return null;

  const lastJob = customer.jobs[0];

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone || "—",
    totalJobs: customer.jobs.length,
    lastServiceDate: lastJob ? timeAgo(lastJob.createdAt) : "Never",
    lastServiceDevice: lastJob
      ? `${lastJob.deviceType} ${lastJob.deviceModel || ""}`.trim()
      : "—",
    jobs: customer.jobs.map((j) => ({
      id: j.id,
      jobNumber: parseInt(j.jobNumber.replace(/^JOB-?/, "")) || 0,
      deviceName: `${j.deviceType} ${j.deviceModel || ""}`.trim(),
      reportedProblem: j.problem,
      status: mapJobStatus(j.status) as any,
      createdAt: timeAgo(j.createdAt),
      totalCost: Number(j.total),
      paymentStatus: j.paymentStatus as any,
    })),
  };
}