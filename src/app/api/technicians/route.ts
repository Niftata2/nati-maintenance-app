import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const technicians = await prisma.user.findMany({
    where: {
      role: "TECHNICIAN",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
    },
  });

  return NextResponse.json(technicians);
}