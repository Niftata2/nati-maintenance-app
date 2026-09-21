"use client";

import { useState, useEffect } from "react";
import { CreditCard, Banknote, Smartphone } from "lucide-react";

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  method: string;
  createdAt: string;
  customer?: { name: string };
  sale?: { invoiceNumber: string };
  job?: { jobNumber: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const methodIcons: Record<string, any> = {
    CASH: Banknote,
    BANK_TRANSFER: CreditCard,
    MOBILE_MONEY: Smartphone,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payments</h1>

      <div className="bg-blue-600 text-white rounded-lg p-6 mb-6">
        <p className="text-sm opacity-90">Total Payments</p>
        <p className="text-3xl font-bold">ETB {totalPayments}</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => {
                const MethodIcon = methodIcons[payment.method] || CreditCard;
                return (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 text-sm font-medium">{payment.paymentNumber}</td>
                    <td className="px-6 py-4 text-sm">{payment.customer?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm">
                      {payment.sale?.invoiceNumber || payment.job?.jobNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="flex items-center">
                        <MethodIcon className="h-4 w-4 mr-2" />
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      ETB {Number(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}