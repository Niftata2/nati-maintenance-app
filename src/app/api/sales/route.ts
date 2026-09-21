import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true,
        cashier: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(sales);
  } catch (error: any) {
    console.error("Sales GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}