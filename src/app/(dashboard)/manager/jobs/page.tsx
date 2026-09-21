import { Suspense } from "react"
import { getJobs, getJobDetail } from "@/actions/jobs"
import { Panel } from "@/components/shared/panel"
import { StatusBadge } from "@/components/shared/status-badge"
import { JobDetailDrawer } from "@/components/shared/job-detail-drawer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface JobsPageProps {
  searchParams: Promise<{ job?: string; q?: string; status?: string }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { job: selectedJobId, q: searchQuery, status: statusFilter } = await searchParams
  const jobs = await getJobs(statusFilter as any, searchQuery)
  const selectedJob = selectedJobId ? await getJobDetail(selectedJobId) : null

  return (
    <div className="space-y-6 animate-page-enter">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="w-full md:w-64">
            <Input placeholder="Search job #, customer, or device..." defaultValue={searchQuery} className="bg-muted/50 border-border text-foreground" />
          </div>
          <select defaultValue={statusFilter || "ALL"} className="h-9 rounded-md border border-border bg-muted/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING">Waiting</option>
            <option value="COMPLETED">Completed</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      <Panel title="All Jobs">
        {/* RESPONSIVE TABLE WRAPPER */}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Job #</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Device</TableHead>
                <TableHead className="text-muted-foreground">Technician</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j.id} className="border-border/50 hover:bg-accent/50 active:bg-accent transition-colors duration-150">
                  <TableCell className="font-mono font-medium">
                    <Link href={`/manager/jobs?job=${j.id}${searchQuery ? `&q=${searchQuery}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`} className="block w-full h-full text-emerald-500 hover:text-emerald-400 active:scale-95 transition-transform duration-100">
                      #{j.jobNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{j.customerName}</div>
                    <div className="text-xs text-muted-foreground">{j.customerPhone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{j.deviceName}</div>
                    <div className="text-xs text-muted-foreground">{j.deviceType}</div>
                  </TableCell>
                  <TableCell>{j.technicianName || <span className="text-amber-500 text-xs font-medium">Unassigned</span>}</TableCell>
                  <TableCell><StatusBadge status={j.status} /></TableCell>
                  <TableCell className="text-right">
                    <Link href={`/manager/jobs?job=${j.id}${searchQuery ? `&q=${searchQuery}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`} className="text-sm font-medium text-emerald-500 hover:text-emerald-400 cursor-pointer active:scale-95 transition-transform duration-100 inline-block">
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No jobs found matching your criteria.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Suspense fallback={null}>
        <JobDetailDrawer job={selectedJob} isOpen={!!selectedJobId} />
      </Suspense>
    </div>
  )
}