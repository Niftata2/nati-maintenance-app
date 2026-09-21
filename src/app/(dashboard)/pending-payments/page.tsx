"use client";

import { useState, useEffect } from "react";
import { Banknote, CreditCard, Smartphone, Check, X, Package } from "lucide-react";

export default function PendingPaymentsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs?status=READY_FOR_PICKUP");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const openJob = (job: any) => {
    setSelectedJob(job);
    setPaidAmount(String(job.total));
    setPaymentMethod("CASH");
    setError("");
  };

  const handleCollect = async () => {
    if (!selectedJob) return;
    const amount = parseFloat(paidAmount) || 0;
    if (amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/jobs/" + selectedJob.id + "/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: paymentMethod }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record payment");
      }

      setSuccess(amount.toLocaleString() + " ETB collected from " + selectedJob.customer.name);
      setSelectedJob(null);
      await fetchPendingJobs();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const methodLabel = (m: string) =>
    m === "CASH" ? "Cash" : m === "BANK_TRANSFER" ? "Bank" : "Mobile";

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Pending Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jobs ready for pickup — collect payment from customers
          </p>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-sm text-emerald-500 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-lg text-center py-16">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No jobs waiting for payment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
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
                    <p className="text-xs text-muted-foreground mb-1">{job.jobNumber}</p>
                    <p className="text-base font-semibold text-foreground">{job.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{job.customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Total Due</p>
                    <p className="text-xl font-bold text-foreground">
                      {Number(job.total).toLocaleString()} ETB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                  <span>
                    <span className="text-muted-foreground">Device:</span>{" "}
                    <span className="text-foreground">{job.deviceType} {job.deviceModel || ""}</span>
                  </span>
                  {Number(job.partsCharge) > 0 && (
                    <span>
                      <span className="text-muted-foreground">Parts:</span>{" "}
                      <span className="text-foreground">{Number(job.partsCharge).toLocaleString()} ETB</span>
                    </span>
                  )}
                  {Number(job.laborCharge) > 0 && (
                    <span>
                      <span className="text-muted-foreground">Labor:</span>{" "}
                      <span className="text-foreground">{Number(job.laborCharge).toLocaleString()} ETB</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="w-[420px] bg-card border-l border-border fixed right-0 top-0 h-screen overflow-y-auto z-20 shadow-xl">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between sticky top-0 bg-card z-10">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Collect Payment</p>
              <h2 className="text-base font-bold text-foreground">{selectedJob.customer.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedJob.customer.phone}</p>
            </div>
            <button
              onClick={() => setSelectedJob(null)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Bill Breakdown
            </h3>
            <div className="space-y-2">
              {Number(selectedJob.partsCharge) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Materials</span>
                  <span className="text-sm font-medium text-foreground">
                    {Number(selectedJob.partsCharge).toLocaleString()} ETB
                  </span>
                </div>
              )}
              {Number(selectedJob.laborCharge) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Labor</span>
                  <span className="text-sm font-medium text-foreground">
                    {Number(selectedJob.laborCharge).toLocaleString()} ETB
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                <span className="text-sm font-bold text-foreground">TOTAL DUE</span>
                <span className="text-2xl font-bold text-foreground">
                  {Number(selectedJob.total).toLocaleString()} ETB
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Amount to Collect (ETB)
            </h3>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              min="0"
              className="w-full px-3 py-3 text-xl font-bold bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "CASH", label: "Cash", Icon: Banknote },
                { key: "BANK_TRANSFER", label: "Bank", Icon: CreditCard },
                { key: "MOBILE_MONEY", label: "Mobile", Icon: Smartphone },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setPaymentMethod(key)}
                  className={
                    "flex flex-col items-center gap-1.5 py-3 rounded-md border text-xs font-medium transition-colors " +
                    (paymentMethod === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50")
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-5 py-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-500">
                {error}
              </div>
            </div>
          )}

          <div className="px-5 py-4 sticky bottom-0 bg-card border-t border-border">
            <button
              onClick={handleCollect}
              disabled={processing}
              className="w-full py-3 bg-emerald-500 text-white text-sm font-medium rounded-md hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              {processing ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}