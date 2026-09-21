import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const newPaid = Number(job.paidAmount) + amount;
    const total = Number(job.total);
    const remaining = Math.max(total - newPaid, 0);

    let paymentStatus: "PAID" | "PARTIALLY_PAID" | "UNPAID" = "UNPAID";
    if (newPaid >= total) paymentStatus = "PAID";
    else if (newPaid > 0) paymentStatus = "PARTIALLY_PAID";

    await prisma.payment.create({
      data: {
        paymentNumber: "PAY-" + Date.now().toString().slice(-8),
        customerId: job.customerId,
        jobId: job.id,
        receivedById: session.user.id,
        amount,
        method: body.method || "CASH",
      },
    });

    const updated = await prisma.job.update({
      where: { id },
      data: {
        paidAmount: newPaid,
        remainingAmount: remaining,
        paymentStatus,
        paymentMethod: body.method || "CASH",
        ...(paymentStatus === "PAID" && { status: "DELIVERED" }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}