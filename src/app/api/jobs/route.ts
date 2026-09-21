import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const jobs = await prisma.job.findMany({
    where,
    include: {
      customer: true,
      technician: true,
      createdBy: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { phone: body.customerPhone },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: body.customerName, phone: body.customerPhone },
      });
    }

    const jobNumber = "JOB-" + Date.now().toString().slice(-6);

    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          jobNumber,
          customerId: customer!.id,
          technicianId: body.technicianId,
          createdById: body.createdById,
          deviceType: body.deviceType,
          deviceModel: body.deviceModel || null,
          serialNumber: body.serialNumber || null,
          problem: body.problem,
          diagnosis: body.diagnosis || null,
          priority: body.priority || "MEDIUM",
          status: body.status || "ASSIGNED",
          laborCharge: body.laborCharge || 0,
          partsCharge: body.partsCharge || 0,
          total: (body.laborCharge || 0) + (body.partsCharge || 0),
          paidAmount: body.paidAmount || 0,
          remainingAmount: (body.laborCharge || 0) + (body.partsCharge || 0) - (body.paidAmount || 0),
          paymentStatus: body.paidAmount > 0 ? "PARTIALLY_PAID" : "UNPAID",
          paymentMethod: body.paymentMethod || null,
        },
        include: { customer: true, technician: true },
      });

      // Save materials if provided
      if (body.items && body.items.length > 0) {
        await tx.jobItem.createMany({
          data: body.items.map((item: any) => ({
            jobId: newJob.id,
            name: item.name,
            quantity: item.quantity,
            unitCost: item.unitCost,
            total: item.total,
          })),
        });
      }

      // Advance payment if any
      if (body.paidAmount > 0) {
        await tx.payment.create({
          data: {
            paymentNumber: "PAY-" + Date.now().toString().slice(-8),
            customerId: customer!.id,
            jobId: newJob.id,
            receivedById: body.createdById,
            amount: body.paidAmount,
            method: body.paymentMethod || "CASH",
          },
        });
      }

      // Notify technician
      await tx.notification.create({
        data: {
          userId: body.technicianId,
          title: "New Job Assigned",
          message: `Job ${jobNumber} has been assigned to you`,
          type: "JOB_ASSIGNED",
        },
      });

      return newJob;
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create job" },
      { status: 500 }
    );
  }
}