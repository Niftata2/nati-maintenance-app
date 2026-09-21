import { Suspense } from "react"
import { getCustomers, getCustomerDetail } from "@/actions/customers"
import { Panel } from "@/components/shared/panel"
import { CustomerDetailDrawer } from "@/components/shared/customer-detail-drawer"
import { CustomerSearch } from "@/components/shared/customer-search"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

interface CustomersPageProps {
  searchParams: Promise<{ customer?: string; q?: string }>
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { customer: selectedCustomerId, q: searchQuery } = await searchParams
  const customers = await getCustomers(searchQuery)
  const selectedCustomer = selectedCustomerId ? await getCustomerDetail(selectedCustomerId) : null

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <CustomerSearch initialQuery={searchQuery} />
      </div>

      <Panel title="All Customers">
        {/* RESPONSIVE TABLE WRAPPER */}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Customer Name</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground text-center">Total Jobs</TableHead>
                <TableHead className="text-muted-foreground">Last Service</TableHead>
                <TableHead className="text-muted-foreground text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const customerUrl = `/manager/customers?customer=${customer.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`
                return (
                  <TableRow key={customer.id} className="border-border/50 hover:bg-accent/50 active:bg-accent transition-colors duration-150">
                    <TableCell className="font-medium">
                      <Link href={customerUrl} className="block h-full w-full text-emerald-500 hover:text-emerald-400 active:scale-95 transition-transform duration-100">
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-foreground">{customer.phone}</TableCell>
                    <TableCell className="text-center text-foreground font-medium">{customer.totalJobs}</TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">{customer.lastServiceDate}</div>
                      <div className="text-xs text-muted-foreground">{customer.lastServiceDevice}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={customerUrl} className="text-sm font-medium text-emerald-500 hover:text-emerald-400 cursor-pointer active:scale-95 transition-transform duration-100 inline-block">
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No customers found matching your search.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Suspense fallback={null}>
        <CustomerDetailDrawer customer={selectedCustomer} isOpen={!!selectedCustomerId} />
      </Suspense>
    </div>
  )
}