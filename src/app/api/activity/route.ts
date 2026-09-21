import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const moduleFilter = searchParams.get("module");

    const where: any = {};
    if (moduleFilter) where.module = moduleFilter;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const log = await prisma.activityLog.create({
      data: {
        userId: body.userId,
        action: body.action,
        module: body.module,
        recordId: body.recordId || null,
        details: body.details || null,
      },
    });
    return NextResponse.json(log);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create log" },
      { status: 500 }
    );
  }
}