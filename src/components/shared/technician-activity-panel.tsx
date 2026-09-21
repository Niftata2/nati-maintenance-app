"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/shared/status-badge"
import type { TechnicianActivity, TechnicianActiveJob } from "../../../domain/types/dashboard"
import { ChevronRight, Wrench } from "lucide-react"

interface TechnicianActivityPanelProps {
  technicians: TechnicianActivity[]
}

export function TechnicianActivityPanel({ technicians }: TechnicianActivityPanelProps) {
  const [selectedTech, setSelectedTech] = useState<TechnicianActivity | null>(null)

  return (
    <>
      <div className="space-y-1">
        {technicians.map((tech) => (
          <button
            key={tech.technicianId}
            onClick={() => setSelectedTech(tech)}
            className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                {tech.technicianName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{tech.technicianName}</div>
                <div className="text-xs text-muted-foreground">{tech.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-muted-foreground"><span className="text-foreground font-medium">{tech.activeJobs}</span> active</div>
              <div className="text-muted-foreground"><span className="text-foreground font-medium">{tech.completedToday}</span> done</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      <Sheet open={!!selectedTech} onOpenChange={() => setSelectedTech(null)}>
      <SheetContent side="right" className="w-full sm:w-[400px] border-l border-border bg-background text-foreground h-full overflow-y-auto p-6">
  {selectedTech && (
    <div className="animate-page-enter"> 
      <SheetHeader className="mb-8 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 font-bold text-lg">
                    {selectedTech.technicianName.charAt(0)}
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-bold text-foreground">{selectedTech.technicianName}</SheetTitle>
                    <SheetDescription className="text-muted-foreground">{selectedTech.role}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-muted/50 p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Active Jobs</div>
                    <div className="text-2xl font-bold text-foreground">{selectedTech.activeJobs}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/50 p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">Completed Today</div>
                    <div className="text-2xl font-bold text-foreground">{selectedTech.completedToday}</div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Wrench className="h-3 w-3" /> Current Workload</h3>
                  <div className="space-y-3">
                    {selectedTech.activeJobsList.map((job: TechnicianActiveJob, idx: number) => (
                      <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm text-foreground">#{job.jobNumber}</div>
                          <div className="text-xs text-muted-foreground mt-1">{job.deviceName}</div>
                        </div>
                        <StatusBadge status={job.status} />
                      </div>
                    ))}
                    {selectedTech.activeJobsList.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-4">No active jobs.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}