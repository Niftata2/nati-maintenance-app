import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: {
      date: "desc",
    },
  });

  return NextResponse.json(expenses);
}