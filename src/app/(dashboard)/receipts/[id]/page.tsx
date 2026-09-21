"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, Download, ArrowLeft, Share2 } from "lucide-react";

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      fetch("/api/sales/" + params.id)
        .then((res) => res.json())
        .then((data) => {
          setSale(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  const handlePrint = () => window.print();
  const handleDownload = () => window.print();

  const handleShare = async () => {
    if (navigator.share && sale) {
      try {
        await navigator.share({
          title: "Receipt " + sale.invoiceNumber,
          text:
            "Receipt from Nati Maintenance\nInvoice: " +
            sale.invoiceNumber +
            "\nTotal: ETB " +
            Number(sale.total).toFixed(2),
        });
      } catch (err) {}
    } else {
      alert("Sharing not supported on this device");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading receipt...
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Receipt not found</p>
        <button
          onClick={() => router.push("/sales-history")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Action buttons (hidden when printing) */}
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
            onClick={handleDownload}
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

      {/* Receipt */}
      <div
        ref={receiptRef}
        className="bg-white text-black rounded-lg shadow-lg p-8 max-w-2xl mx-auto print:shadow-none print:rounded-none"
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">NATI MAINTENANCE</h1>
          <p className="text-sm mt-1 text-gray-700">
            Phone & Computer Repair Services
          </p>
          <p className="text-sm text-gray-700">Addis Ababa, Ethiopia</p>
          <p className="text-sm text-gray-700">Tel: +251 911 000 000</p>
        </div>

        {/* Invoice + Date */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p className="text-gray-500 uppercase text-xs tracking-wide">Invoice Number</p>
            <p className="font-bold text-lg mt-0.5">{sale.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 uppercase text-xs tracking-wide">Date</p>
            <p className="font-medium mt-0.5">
              {new Date(sale.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(sale.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Billed To</p>
          <p className="font-semibold mt-1">{sale.customer?.name || "Walk-in Customer"}</p>
          {sale.customer?.phone && (
            <p className="text-sm text-gray-600">{sale.customer.phone}</p>
          )}
        </div>

        {/* Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 text-xs uppercase tracking-wide">Item</th>
              <th className="text-center py-2 text-xs uppercase tracking-wide">Qty</th>
              <th className="text-right py-2 text-xs uppercase tracking-wide">Price</th>
              <th className="text-right py-2 text-xs uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-2 text-sm">{item.product?.name || "Product"}</td>
                <td className="py-2 text-sm text-center">{item.quantity}</td>
                <td className="py-2 text-sm text-right">
                  {Number(item.unitPrice).toFixed(2)}
                </td>
                <td className="py-2 text-sm text-right font-medium">
                  {Number(item.total).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t-2 border-black pt-4 ml-auto max-w-xs">
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{Number(sale.subtotal).toFixed(2)}</span>
          </div>
          {Number(sale.discount) > 0 && (
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600">Discount</span>
              <span>- {Number(sale.discount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-300 pt-2 mb-2">
            <span className="font-bold text-lg">TOTAL</span>
            <span className="font-bold text-lg">
              {Number(sale.total).toFixed(2)} ETB
            </span>
          </div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Paid</span>
            <span>{Number(sale.paidAmount).toFixed(2)}</span>
          </div>
          {Number(sale.remainingAmount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="font-bold text-red-600">Remaining</span>
              <span className="font-bold text-red-600">
                {Number(sale.remainingAmount).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-600">Method</span>
            <span className="font-medium">{sale.paymentMethod || "CASH"}</span>
          </div>
          <div className="flex justify-between mt-1 text-sm">
            <span className="text-gray-600">Status</span>
            <span className="font-bold">{sale.status}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-4 border-t border-gray-300">
          <p className="text-sm font-medium">Thank you for your business!</p>
          <p className="text-xs text-gray-500 mt-2">
            For inquiries, please contact us
          </p>
          <p className="text-xs text-gray-500 mt-1">
            *** Please keep this receipt for your records ***
          </p>
        </div>
      </div>

      {/* Print styles */}
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