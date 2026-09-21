"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, Download, ArrowLeft, Share2 } from "lucide-react";

export default function JobReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch("/api/jobs/" + params.id)
        .then((res) => res.json())
        .then((data) => {
          setJob(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share && job) {
      try {
        await navigator.share({
          title: "Repair Receipt " + job.jobNumber,
          text:
            "Repair Receipt from Nati Maintenance\nJob: " +
            job.jobNumber +
            "\nTotal: ETB " +
            Number(job.total).toFixed(2),
        });
      } catch (err) {}
    } else {
      alert("Sharing not supported");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading receipt...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found</p>
        <button
          onClick={() => router.push("/pending-payments")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent flex items-center gap-2 text-sm"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-2 text-sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="bg-white text-black rounded-lg shadow-lg p-8 max-w-2xl mx-auto print:shadow-none print:rounded-none">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">NATI MAINTENANCE</h1>
          <p className="text-sm mt-1 text-gray-700">Repair Service Receipt</p>
          <p className="text-sm text-gray-700">Addis Ababa, Ethiopia</p>
          <p className="text-sm text-gray-700">Tel: +251 911 000 000</p>
        </div>

        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p className="text-gray-500 uppercase text-xs tracking-wide">Job Number</p>
            <p className="font-bold text-lg mt-0.5">{job.jobNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 uppercase text-xs tracking-wide">Date</p>
            <p className="font-medium mt-0.5">
              {new Date(job.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
          <p className="font-semibold mt-1">{job.customer?.name}</p>
          {job.customer?.phone && (
            <p className="text-sm text-gray-600">{job.customer.phone}</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wide mb-2">Device</h3>
          <p className="text-sm">
            {job.deviceType} {job.deviceModel || ""}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wide mb-2">Reported Problem</h3>
          <p className="text-sm text-gray-700">{job.problem}</p>
        </div>

        {job.diagnosis && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2">Diagnosis / Work Done</h3>
            <p className="text-sm text-gray-700">{job.diagnosis}</p>
          </div>
        )}

        {job.items && job.items.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2">Materials Used</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left py-1.5 text-xs uppercase">Item</th>
                  <th className="text-center py-1.5 text-xs uppercase">Qty</th>
                  <th className="text-right py-1.5 text-xs uppercase">Price</th>
                  <th className="text-right py-1.5 text-xs uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {job.items.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1.5 text-sm">{item.name}</td>
                    <td className="py-1.5 text-sm text-center">{item.quantity}</td>
                    <td className="py-1.5 text-sm text-right">
                      {Number(item.unitCost).toFixed(2)}
                    </td>
                    <td className="py-1.5 text-sm text-right">
                      {Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t-2 border-black pt-4 ml-auto max-w-xs">
          {Number(job.partsCharge) > 0 && (
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600">Materials</span>
              <span>{Number(job.partsCharge).toFixed(2)}</span>
            </div>
          )}
          {Number(job.laborCharge) > 0 && (
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600">Labor</span>
              <span>{Number(job.laborCharge).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-300 pt-2 mb-2">
            <span className="font-bold text-lg">TOTAL</span>
            <span className="font-bold text-lg">
              {Number(job.total).toFixed(2)} ETB
            </span>
          </div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Paid</span>
            <span>{Number(job.paidAmount).toFixed(2)}</span>
          </div>
          {Number(job.remainingAmount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="font-bold text-red-600">Remaining</span>
              <span className="font-bold text-red-600">
                {Number(job.remainingAmount).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-600">Status</span>
            <span className="font-bold">{job.paymentStatus}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 border-t border-gray-300 grid grid-cols-2 gap-12">
          <div>
            <div className="border-t border-black pt-2">
              <p className="text-xs text-gray-600">Customer Signature</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-2">
              <p className="text-xs text-gray-600">Authorized By</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 pt-4 border-t border-gray-300">
          <p className="text-sm font-medium">Thank you for trusting Nati Maintenance</p>
          <p className="text-xs text-gray-500 mt-2">
            This is a service receipt. Please keep for your records.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}