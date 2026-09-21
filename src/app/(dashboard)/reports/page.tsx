import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  const [totalSales, totalRevenue, totalJobs, totalExpenses, totalPayments] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.aggregate({ _sum: { total: true } }),
    prisma.job.count(),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);

  const completedJobs = await prisma.job.count({ where: { status: "COMPLETED" } });
  const pendingJobs = await prisma.job.count({ where: { status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] } } });

  const revenue = Number(totalRevenue._sum.total || 0);
  const expenses = Number(totalExpenses._sum.amount || 0);
  const profit = revenue - expenses;

  const reportData = [
    { label: "Total Sales", value: totalSales, color: "bg-blue-100 text-blue-800" },
    { label: "Total Revenue", value: `ETB ${revenue}`, color: "bg-green-100 text-green-800" },
    { label: "Total Jobs", value: totalJobs, color: "bg-purple-100 text-purple-800" },
    { label: "Completed Jobs", value: completedJobs, color: "bg-teal-100 text-teal-800" },
    { label: "Pending Jobs", value: pendingJobs, color: "bg-yellow-100 text-yellow-800" },
    { label: "Total Expenses", value: `ETB ${expenses}`, color: "bg-red-100 text-red-800" },
    { label: "Total Payments", value: `ETB ${Number(totalPayments._sum.amount || 0)}`, color: "bg-indigo-100 text-indigo-800" },
    { label: "Estimated Profit", value: `ETB ${profit}`, color: "bg-emerald-100 text-emerald-800" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportData.map((item) => (
          <div key={item.label} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${item.color}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-gray-600">Revenue</span>
            <span className="text-2xl font-bold text-green-600">ETB {revenue}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-gray-600">Expenses</span>
            <span className="text-2xl font-bold text-red-600">ETB {expenses}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">Profit</span>
            <span className="text-3xl font-bold text-blue-600">ETB {profit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}