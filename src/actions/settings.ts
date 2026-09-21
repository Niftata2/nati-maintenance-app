"use server";

import { prisma } from "@/lib/prisma";
import type { User, BusinessProfile } from "../../domain/types/settings";

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    fullName: u.name,
    phone: u.phone || "",
    role:
      u.role === "OWNER"
        ? "MANAGER"
        : u.role === "CASHIER"
        ? "CASHIER"
        : "PHONE_TECHNICIAN",
    status: u.isActive ? "ACTIVE" : "INACTIVE",
    joinedDate: u.createdAt.toISOString().slice(0, 10),
  }));
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  // No BusinessProfile table yet — return defaults
  return {
    businessName: "Nati Maintenance",
    phone: "+251 911 000 000",
    email: "info@natimaintenance.com",
    address: "Bole Road, Addis Ababa",
    taxId: "",
  };
}