import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all sales (POS)
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        cashier: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Fetch all payments linked to jobs (repair payments)
    const jobPayments = await prisma.payment.findMany({
      where: {
        jobId: { not: null },
      },
      include: {
        customer: true,
        job: true,
        receivedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Normalize sales into unified shape
    const normalizedSales = sales.map((s) => ({
      id: s.id,
      type: "SALE" as const,
      reference: s.invoiceNumber,
      customerName: s.customer?.name || "Walk-in Customer",
      customerPhone: s.customer?.phone || null,
      amount: Number(s.total),
      paidAmount: Number(s.paidAmount),
      remainingAmount: Number(s.remainingAmount),
      status: s.status,
      method: s.paymentMethod,
      cashier: s.cashier?.name || "—",
      createdAt: s.createdAt.toISOString(),
      items: s.items.map((it) => ({
        name: it.product?.name || "Product",
        sku: it.product?.sku || "",
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        total: Number(it.total),
      })),
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      jobNumber: null,
      deviceName: null,
    }));

    // Normalize job payments — group by job so we show the job once with total
    const jobMap: Record<string, any> = {};
    for (const p of jobPayments) {
      if (!p.job) continue;
      const jobId = p.job.id;
      if (!jobMap[jobId]) {
        jobMap[jobId] = {
          id: jobId,
          type: "REPAIR" as const,
          reference: p.job.jobNumber,
          customerName: p.customer?.name || p.job.customerId ? "" : "Walk-in",
          customerPhone: p.customer?.phone || null,
          amount: Number(p.job.total),
          paidAmount: Number(p.job.paidAmount),
          remainingAmount: Number(p.job.remainingAmount),
          status: p.job.paymentStatus,
          method: p.job.paymentMethod || p.method,
          cashier: p.receivedBy.name,
          createdAt: p.job.createdAt.toISOString(),
          items: [],
          subtotal: Number(p.job.total),
          discount: 0,
          jobNumber: p.job.jobNumber,
          deviceName: `${p.job.deviceType} ${p.job.deviceModel || ""}`.trim(),
          problem: p.job.problem,
          diagnosis: p.job.diagnosis,
        };
      }
    }

    // Also include jobs with payments but no linked payment records
    const allJobsWithPayment = await prisma.job.findMany({
      where: {
        paymentStatus: { in: ["PAID", "PARTIALLY_PAID"] },
      },
      include: {
        customer: true,
        payments: { include: { receivedBy: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    for (const j of allJobsWithPayment) {
      if (jobMap[j.id]) continue;
      const lastPayment = j.payments[0];
      jobMap[j.id] = {
        id: j.id,
        type: "REPAIR" as const,
        reference: j.jobNumber,
        customerName: j.customer.name,
        customerPhone: j.customer.phone,
        amount: Number(j.total),
        paidAmount: Number(j.paidAmount),
        remainingAmount: Number(j.remainingAmount),
        status: j.paymentStatus,
        method: j.paymentMethod || lastPayment?.method || "CASH",
        cashier: lastPayment?.receivedBy.name || "—",
        createdAt: j.createdAt.toISOString(),
        items: [],
        subtotal: Number(j.total),
        discount: 0,
        jobNumber: j.jobNumber,
        deviceName: `${j.deviceType} ${j.deviceModel || ""}`.trim(),
        problem: j.problem,
        diagnosis: j.diagnosis,
      };
    }

    const allItems = [...normalizedSales, ...Object.values(jobMap)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(allItems);
  } catch (error: any) {
    console.error("Sales history error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sales history" },
      { status: 500 }
    );
  }
}