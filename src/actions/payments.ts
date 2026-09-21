"use server";

import { prisma } from "@/lib/prisma";
import type { Payment, PaymentSummary, PaymentDetail } from "../../domain/types/payment";

function mapMethod(m: string): "CASH" | "TELEBIRR" | "BANK_TRANSFER" | "CARD" {
  if (m === "CASH") return "CASH";
  if (m === "BANK_TRANSFER") return "BANK_TRANSFER";
  if (m === "MOBILE_MONEY") return "TELEBIRR";
  return "CASH";
}

function mapStatus(s: string): "PAID" | "PARTIALLY_PAID" | "PENDING" {
  if (s === "PAID") return "PAID";
  if (s === "PARTIALLY_PAID") return "PARTIALLY_PAID";
  return "PENDING";
}

export async function getPayments(statusFilter?: string, searchQuery?: string): Promise<Payment[]> {
  const payments = await prisma.payment.findMany({
    include: {
      customer: true,
      job: true,
      receivedBy: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return payments
    .filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.paymentNumber.toLowerCase().includes(q) ||
          (p.customer?.name || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    })
    .map((p) => ({
      id: p.id,
      paymentNumber: parseInt(p.paymentNumber.replace(/^PAY-?/, "")) || 0,
      jobId: p.jobId || "",
      jobNumber: p.job ? parseInt(p.job.jobNumber.replace(/^JOB-?/, "")) || 0 : 0,
      customerName: p.customer?.name || "Walk-in",
      amount: Number(p.amount),
      paymentMethod: mapMethod(p.method),
      paymentStatus: p.job?.paymentStatus ? mapStatus(p.job.paymentStatus) : "PAID",
      paidAt: p.createdAt.toISOString(),
      recordedBy: p.receivedBy.name,
      notes: p.notes || undefined,
    }));
}

export async function getPaymentSummary(): Promise<PaymentSummary> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allPayments, todayPayments, unpaidJobs] = await Promise.all([
    prisma.payment.findMany({ select: { amount: true, method: true } }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: today } },
      _sum: { amount: true },
    }),
    prisma.job.findMany({
      where: { paymentStatus: { not: "PAID" }, status: { notIn: ["CANCELLED", "NOT_REPAIRABLE"] } },
      select: { remainingAmount: true, createdAt: true },
    }),
  ]);

  const totalRevenue = allPayments.reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = unpaidJobs.reduce((s, j) => s + Number(j.remainingAmount), 0);
  const overdue = unpaidJobs.filter((j) => Date.now() - new Date(j.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000);
  const overduePayments = overdue.reduce((s, j) => s + Number(j.remainingAmount), 0);
  const avgTicket = allPayments.length > 0 ? totalRevenue / allPayments.length : 0;

  const breakdown = { cash: 0, telebirr: 0, bankTransfer: 0, card: 0 };
  allPayments.forEach((p) => {
    const m = mapMethod(p.method);
    if (m === "CASH") breakdown.cash += Number(p.amount);
    else if (m === "TELEBIRR") breakdown.telebirr += Number(p.amount);
    else if (m === "BANK_TRANSFER") breakdown.bankTransfer += Number(p.amount);
    else breakdown.card += Number(p.amount);
  });

  return {
    totalRevenue,
    pendingPayments,
    overduePayments,
    averageTicketSize: avgTicket,
    todayCollections: Number(todayPayments._sum.amount || 0),
    paymentMethodBreakdown: breakdown,
  };
}

export async function getPaymentDetail(id: string): Promise<PaymentDetail | null> {
  const p = await prisma.payment.findUnique({
    where: { id },
    include: {
      customer: true,
      job: true,
      receivedBy: true,
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    paymentNumber: parseInt(p.paymentNumber.replace(/^PAY-?/, "")) || 0,
    jobId: p.jobId || "",
    jobNumber: p.job ? parseInt(p.job.jobNumber.replace(/^JOB-?/, "")) || 0 : 0,
    customerName: p.customer?.name || "Walk-in",
    amount: Number(p.amount),
    paymentMethod: mapMethod(p.method),
    paymentStatus: p.job?.paymentStatus ? mapStatus(p.job.paymentStatus) : "PAID",
    paidAt: p.createdAt.toISOString(),
    recordedBy: p.receivedBy.name,
    notes: p.notes || undefined,
    jobDetails: {
      deviceName: p.job ? `${p.job.deviceType} ${p.job.deviceModel || ""}`.trim() : "",
      reportedProblem: p.job?.problem || "",
      totalCost: Number(p.job?.total || 0),
      remainingBalance: Number(p.job?.remainingAmount || 0),
    },
  };
}