"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/shared/status-badge"
import type { JobDetail, JobActivity } from "../../../domain/types/job"
import { useRouter } from "next/navigation"
import { User, Wrench, Clock } from "lucide-react"
import { CopyToClipboard } from "@/components/shared/copy-to-clipboard"

interface JobDetailDrawerProps {
  job: JobDetail | null
  isOpen: boolean
}

export function JobDetailDrawer({ job, isOpen }: JobDetailDrawerProps) {
  const router = useRouter()
  const handleClose = () => router.push("/manager/jobs")
  if (!job) return null

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:w-[480px] border-l border-border bg-background text-foreground h-full overflow-y-auto p-6">
  <div className="animate-page-enter"> 
  <SheetHeader className="mb-6 border-b border-border pb-4">
  <div className="flex items-center gap-3 group"> {/* <-- Added 'group' */}
    <SheetTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
      Job #{job.jobNumber}
      <CopyToClipboard text={job.jobNumber.toString()} /> {/* <-- Added Button */}
    </SheetTitle>
    <StatusBadge status={job.status} />
  </div>
          <SheetDescription className="text-muted-foreground text-sm mt-2">Created {job.createdAt} • Priority: <span className="text-foreground font-medium">{job.priority}</span></SheetDescription>
        </SheetHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2"><User className="h-3 w-3" /> Customer</div>
              <div className="font-semibold text-foreground">{job.customerName}</div>
              <div className="text-sm text-muted-foreground">{job.customerPhone}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase mb-2"><Wrench className="h-3 w-3" /> Device</div>
              <div className="font-semibold text-foreground">{job.deviceName}</div>
              <div className="text-xs text-muted-foreground mt-1">{job.deviceType}</div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Assigned Technician</span>
              <span className="font-semibold text-foreground">{job.technicianName || "Unassigned"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <span className="font-bold text-foreground text-lg">{job.totalCost.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Status</span>
              <span className={`font-bold ${job.paymentStatus === "PAID" ? "text-emerald-500" : job.paymentStatus === "PARTIALLY_PAID" ? "text-amber-500" : "text-red-500"}`}>{job.paymentStatus.replace("_", " ")}</span>
            </div>
          </div>
          {(job.diagnosis || job.workPerformed) && (
            <div className="space-y-3">
              {job.diagnosis && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Diagnosis</div>
                  <p className="text-sm text-foreground/80">{job.diagnosis}</p>
                </div>
              )}
              {job.workPerformed && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Work Performed</div>
                  <p className="text-sm text-foreground/80">{job.workPerformed}</p>
                </div>
              )}
            </div>
          )}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Clock className="h-3 w-3" /> Activity History</h3>
            <div className="space-y-4 border-l border-border pl-4 ml-2">
              {job.activities.map((activity: JobActivity) => (
                <div key={activity.id} className="relative">
                  <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                  <div className="text-sm font-semibold text-foreground">{activity.action}</div>
                  {activity.details && <div className="text-sm text-muted-foreground mt-0.5">{activity.details}</div>}
                  <div className="mt-1 text-xs text-muted-foreground">{activity.timestamp} • {activity.actorName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}