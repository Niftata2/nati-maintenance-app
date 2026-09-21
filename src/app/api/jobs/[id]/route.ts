import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: true,
        createdBy: true,
        items: true,
        payments: true,
      },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error("Job GET error:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: any = {};

    if (body.diagnosis !== undefined) data.diagnosis = body.diagnosis;
    if (body.laborCharge !== undefined) data.laborCharge = body.laborCharge;
    if (body.partsCharge !== undefined) data.partsCharge = body.partsCharge;

    if (body.total !== undefined) {
      data.total = body.total;
      const job = await prisma.job.findUnique({ where: { id } });
      const paid = Number(job?.paidAmount || 0);
      data.remainingAmount = body.total - paid;
      if (body.total === paid) data.paymentStatus = "PAID";
      else if (paid > 0) data.paymentStatus = "PARTIALLY_PAID";
      else data.paymentStatus = "UNPAID";
    }

    if (body.status) {
      data.status = body.status;
      if (body.status === "IN_PROGRESS") data.startedAt = new Date();
      if (
        body.status === "READY_FOR_PICKUP" ||
        body.status === "COMPLETED" ||
        body.status === "NOT_REPAIRABLE"
      ) {
        data.completedAt = new Date();
      }
    }

    if (body.items) {
      await prisma.jobItem.deleteMany({ where: { jobId: id } });
      if (body.items.length > 0) {
        await prisma.jobItem.createMany({
          data: body.items.map((item: any) => ({
            jobId: id,
            name: item.name,
            quantity: item.quantity,
            unitCost: item.unitCost,
            total: item.total,
          })),
        });
      }
    }

    const job = await prisma.job.update({
      where: { id },
      data,
      include: { items: true, customer: true, technician: true },
    });

    if (body.status === "READY_FOR_PICKUP") {
      const cashiers = await prisma.user.findMany({
        where: { role: "CASHIER", isActive: true },
        select: { id: true },
      });
      for (const cashier of cashiers) {
        await prisma.notification.create({
          data: {
            userId: cashier.id,
            title: "Job Ready for Payment",
            message: `Job ${job.jobNumber} (${job.customer.name}) is ready — ${Number(job.total).toLocaleString()} ETB`,
            type: "JOB_READY_FOR_PAYMENT",
          },
        });
      }
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update job" },
      { status: 500 }
    );
  }
}