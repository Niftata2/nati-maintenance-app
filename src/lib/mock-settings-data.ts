import type { User, BusinessProfile } from "../../domain/types/settings"

export const MOCK_USERS: User[] = [
  { id: "u1", fullName: "Abebe Tesfaye", phone: "+251 911 000 000", role: "MANAGER", status: "ACTIVE", joinedDate: "Jan 2024" },
  { id: "u2", fullName: "Meron Kebede", phone: "+251 922 111 111", role: "CASHIER", status: "ACTIVE", joinedDate: "Feb 2024" },
  { id: "u3", fullName: "Dawit Alemu", phone: "+251 933 222 222", role: "PHONE_TECHNICIAN", status: "ACTIVE", joinedDate: "Mar 2024" },
  { id: "u4", fullName: "Selam Girma", phone: "+251 944 333 333", role: "COMPUTER_TECHNICIAN", status: "ACTIVE", joinedDate: "Apr 2024" },
  { id: "u5", fullName: "Yonas Bekele", phone: "+251 955 444 444", role: "PHONE_TECHNICIAN", status: "INACTIVE", joinedDate: "May 2024" },
]

export const MOCK_BUSINESS_PROFILE: BusinessProfile = {
  businessName: "Nati Mobile Maintenance",
  phone: "+251 911 123 456",
  email: "contact@natimaintenance.com",
  address: "Hawassa, Ethiopia",
  taxId: "TIN-123456789",
}

export async function getUsers(): Promise<User[]> {
  return MOCK_USERS
}

export async function getBusinessProfile(): Promise<BusinessProfile> {
  return MOCK_BUSINESS_PROFILE
}