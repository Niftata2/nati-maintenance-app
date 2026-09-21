"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Wrench, Clock, CheckCircle, PlayCircle, X, Package, Plus, Trash2, Ban } from "lucide-react";

export default function MyJobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [laborCharge, setLaborCharge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [newMaterial, setNewMaterial] = useState({ name: "", quantity: "1", unitCost: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await fetch("/api/my-jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openJob = (job: any) => {
    setSelectedJob(job);
    setMaterials(job.items || []);
    setLaborCharge(String(job.laborCharge || ""));
    setDiagnosis(job.diagnosis || "");
    setError("");
  };

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.unitCost) return;
    const qty = parseInt(newMaterial.quantity) || 1;
    const cost = parseFloat(newMaterial.unitCost) || 0;
    setMaterials([
      ...materials,
      { name: newMaterial.name, quantity: qty, unitCost: cost, total: qty * cost },
    ]);
    setNewMaterial({ name: "", quantity: "1", unitCost: "" });
  };

  const removeMaterial = (idx: number) => {
    setMaterials(materials.filter((_, i) => i !== idx));
  };

  const materialsTotal = materials.reduce((sum, m) => sum + Number(m.total), 0);
  const laborTotal = parseFloat(laborCharge) || 0;
  const grandTotal = materialsTotal + laborTotal;

  const saveJob = async (markDone: boolean = false) => {
    if (!selectedJob) return;
    setError("");

    if (markDone && !diagnosis.trim()) {
      setError("Please write a diagnosis before marking work done");
      return;
    }
    if (markDone && grandTotal === 0) {
      setError("Please add materials or labor charge before marking done");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/jobs/" + selectedJob.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis,
          laborCharge: laborTotal,
          partsCharge: materialsTotal,
          total: grandTotal,
          items: materials.map((m) => ({
            name: m.name,
            quantity: m.quantity,
            unitCost: m.unitCost,
            total: m.total,
          })),
          ...(markDone && { status: "READY_FOR_PICKUP" }),
        }),
      });

      if (res.ok) {
        await fetchMyJobs();
        if (markDone) {
          setSelectedJob(null);
        }
      } else {
        setError("Failed to save job");
      }
    } catch (error) {
      setError("Failed to save job");
    } finally {
      setProcessing(false);
    }
  };

  const updateStatus = async (jobId: string, newStatus: string) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/jobs/" + jobId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchMyJobs();
        if (newStatus === "READY_FOR_PICKUP" || newStatus === "NOT_REPAIRABLE") {
          setSelectedJob(null);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const statusStyle = (status: string) => {
    const styles: Record<string, { dot: string; label: string; bg: string; text: string }> = {
      PENDING: { dot: "bg-zinc-400", label: "Pending", bg: "bg-zinc-500/10", text: "text-zinc-400" },
      ASSIGNED: { dot: "bg-cyan-500", label: "Assigned", bg: "bg-cyan-500/10", text: "text-cyan-500" },
      IN_PROGRESS: { dot: "bg-blue-500", label: "In Progress", bg: "bg-blue-500/10", text: "text-blue-500" },
      WAITING_FOR_PARTS: { dot: "bg-amber-500", label: "Waiting", bg: "bg-amber-500/10", text: "text-amber-500" },
      READY_FOR_PICKUP: { dot: "bg-purple-500", label: "Ready for Pickup", bg: "bg-purple-500/10", text: "text-purple-500" },
      COMPLETED: { dot: "bg-emerald-500", label: "Completed", bg: "bg-emerald-500/10", text: "text-emerald-500" },
      DELIVERED: { dot: "bg-zinc-500", label: "Delivered", bg: "bg-zinc-500/10", text: "text-zinc-400" },
      NOT_REPAIRABLE: { dot: "bg-red-500", label: "Not Repairable", bg: "bg-red-500/10", text: "text-red-500" },
      CANCELLED: { dot: "bg-red-500", label: "Cancelled", bg: "bg-red-500/10", text: "text-red-500" },
    };
    return styles[status] || { dot: "bg-zinc-400", label: status, bg: "bg-zinc-500/10", text: "text-zinc-400" };
  };

  const paymentStyle = (status: string) => {
    if (status === "PAID") return "bg-emerald-500/10 text-emerald-500";
    if (status === "PARTIALLY_PAID") return "bg-amber-500/10 text-amber-500";
    return "bg-red-500/10 text-red-500";
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jobs assigned to you — click to edit
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-lg text-center py-16">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No jobs assigned to you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const s = statusStyle(job.status);
              return (
                <div
                  key={job.id}
                  onClick={() => openJob(job)}
                  className={
                    "bg-card border rounded-lg p-5 cursor-pointer transition-colors " +
                    (selectedJob?.id === job.id ? "border-primary" : "border-border hover:border-primary/40")
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-foreground">{job.jobNumber}</span>
                        <span className={"flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full " + s.bg + " " + s.text}>
                          <span className={"w-1.5 h-1.5 rounded-full " + s.dot}></span>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{job.customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-base font-bold text-foreground">
                        {Number(job.total).toLocaleString()} ETB
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">Device:</span> {job.deviceType} {job.deviceModel || ""}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.problem}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="w-[440px] bg-card border-l border-border fixed right-0 top-0 h-screen overflow-y-auto z-20 shadow-xl">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between sticky top-0 bg-card z-10">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{selectedJob.jobNumber}</p>
              <h2 className="text-base font-bold text-foreground">
                {selectedJob.deviceType} {selectedJob.deviceModel || ""}
              </h2>
            </div>
            <button onClick={() => setSelectedJob(null)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Customer</h3>
            <p className="text-sm font-medium text-foreground">{selectedJob.customer.name}</p>
            <p className="text-xs text-muted-foreground">{selectedJob.customer.phone}</p>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Reported Problem</h3>
            <p className="text-sm text-foreground leading-relaxed">{selectedJob.problem}</p>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Diagnosis / Notes
            </h3>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="What did you find? What did you do?"
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Materials Used
            </h3>

            {materials.length > 0 && (
              <div className="space-y-2 mb-3">
                {materials.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-background border border-border rounded-md px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.quantity} × {Number(m.unitCost).toLocaleString()} ETB
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-sm font-semibold text-foreground">
                        {Number(m.total).toLocaleString()}
                      </span>
                      <button onClick={() => removeMaterial(idx)} className="text-muted-foreground hover:text-red-500 p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-background border border-border rounded-md p-3 space-y-2">
              <input
                type="text"
                placeholder="Material name (e.g., Screen)"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Unit cost"
                  min="0"
                  value={newMaterial.unitCost}
                  onChange={(e) => setNewMaterial({ ...newMaterial, unitCost: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={addMaterial}
                className="w-full py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Material
              </button>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Labor Charge (ETB)
            </h3>
            <input
              type="number"
              value={laborCharge}
              onChange={(e) => setLaborCharge(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Cost Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Materials</span>
                <span className="text-sm font-medium text-foreground">{materialsTotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Labor</span>
                <span className="text-sm font-medium text-foreground">{laborTotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{grandTotal.toLocaleString()} ETB</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-5 py-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-500">
                {error}
              </div>
            </div>
          )}

          <div className="px-5 py-4 sticky bottom-0 bg-card border-t border-border space-y-2">
            {selectedJob.status === "ASSIGNED" && (
              <button
                onClick={() => updateStatus(selectedJob.id, "IN_PROGRESS")}
                disabled={processing}
                className="w-full py-2.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Start Work
              </button>
            )}

            {(selectedJob.status === "IN_PROGRESS" || selectedJob.status === "WAITING_FOR_PARTS") && (
              <>
                <button
                  onClick={() => saveJob(false)}
                  disabled={processing}
                  className="w-full py-2.5 border border-border text-foreground text-sm font-medium rounded-md hover:bg-accent disabled:opacity-50"
                >
                  {processing ? "Saving..." : "Save Progress"}
                </button>
                <button
                  onClick={() => saveJob(true)}
                  disabled={processing}
                  className="w-full py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-md hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Work Done → Send to Cashier
                </button>
                {selectedJob.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => updateStatus(selectedJob.id, "WAITING_FOR_PARTS")}
                    disabled={processing}
                    className="w-full py-2.5 bg-amber-500/10 text-amber-500 text-sm font-medium rounded-md hover:bg-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Waiting for Parts
                  </button>
                )}
                <button
                  onClick={() => updateStatus(selectedJob.id, "NOT_REPAIRABLE")}
                  disabled={processing}
                  className="w-full py-2.5 bg-red-500/10 text-red-500 text-sm font-medium rounded-md hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Ban className="h-4 w-4" />
                  Not Repairable
                </button>
              </>
            )}

            {selectedJob.status === "READY_FOR_PICKUP" && (
              <div className="text-center py-3">
                <p className="text-sm text-emerald-500 font-medium">✓ Sent to Cashier</p>
                <p className="text-xs text-muted-foreground mt-1">Waiting for customer payment</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}