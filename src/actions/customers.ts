"use server"

import type { Customer, CustomerDetail } from "../../domain/types/customer"

// TEMPORARY MOCK DATA — Backend will replace this with Prisma queries
const MOCK_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Fikru Alemu", phone: "+251 911 234 567", totalJobs: 4, lastServiceDate: "2 days ago", lastServiceDevice: "iPhone 12" },
  { id: "c2", name: "Bethelhem T.", phone: "+251 922 345 678", totalJobs: 1, lastServiceDate: "1 week ago", lastServiceDevice: "Dell Latitude" },
  { id: "c3", name: "Kebede W.", phone: "+251 933 456 789", totalJobs: 7, lastServiceDate: "3 days ago", lastServiceDevice: "Samsung A14" },
  { id: "c4", name: "Hanna M.", phone: "+251 944 567 890", totalJobs: 2, lastServiceDate: "1 month ago", lastServiceDevice: "HP Pavilion" },
]

const MOCK_CUSTOMER_DETAILS: Record<string, CustomerDetail> = {
  "c1": {
    id: "c1", name: "Fikru Alemu", phone: "+251 911 234 567", totalJobs: 4, lastServiceDate: "2 days ago", lastServiceDevice: "iPhone 12",
    jobs: [
      { id: "j1042", jobNumber: 1042, deviceName: "iPhone 12", reportedProblem: "Screen cracked, touch not responding", status: "IN_PROGRESS", createdAt: "2 days ago", totalCost: 4500, paymentStatus: "UNPAID" },
      { id: "j1015", jobNumber: 1015, deviceName: "iPhone 12", reportedProblem: "Battery replacement", status: "DELIVERED", createdAt: "3 months ago", totalCost: 1200, paymentStatus: "PAID" },
    ]
  },
  "c2": {
    id: "c2", name: "Bethelhem T.", phone: "+251 922 345 678", totalJobs: 1, lastServiceDate: "1 week ago", lastServiceDevice: "Dell Latitude",
    jobs: [
      { id: "j1041", jobNumber: 1041, deviceName: "Dell Latitude", reportedProblem: "Won't turn on, possible motherboard issue", status: "WAITING", createdAt: "1 week ago", totalCost: 0, paymentStatus: "UNPAID" },
    ]
  }
}

export async function getCustomers(searchQuery?: string): Promise<Customer[]> {
  // TODO: Backend will implement Prisma: db.customer.findMany({ where: { name: { contains: searchQuery } } })
  if (!searchQuery) return MOCK_CUSTOMERS
  return MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  )
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  // TODO: Backend will implement Prisma: db.customer.findUnique({ where: { id }, include: { jobs: true } })
  return MOCK_CUSTOMER_DETAILS[id] || null
}