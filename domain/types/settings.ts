export type UserRole = "MANAGER" | "CASHIER" | "PHONE_TECHNICIAN" | "COMPUTER_TECHNICIAN"

export type UserStatus = "ACTIVE" | "INACTIVE"

export type User = {
  id: string
  fullName: string
  phone: string
  role: UserRole
  status: UserStatus
  joinedDate: string
}

export type BusinessProfile = {
  businessName: string
  phone: string
  email: string
  address: string
  taxId?: string
}