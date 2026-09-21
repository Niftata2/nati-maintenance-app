import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [totalSales, totalJobs, totalCustomers, totalProducts, lowStock, totalRevenue] = await Promise.all([
    prisma.sale.count(),
    prisma.job.count(),
    prisma.customer.count(),
    prisma.product.count(),
    prisma.product.count({ where: { currentStock: { lte: prisma.product.fields.minimumStock } } }),
    prisma.sale.aggregate({ _sum: { total: true } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySales = await prisma.sale.count({
    where: { createdAt: { gte: today } },
  });

  const todayRevenue = await prisma.sale.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { total: true },
  });

  const pendingJobs = await prisma.job.count({
    where: { status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] } },
  });

  const completedJobs = await prisma.job.count({
    where: { status: "COMPLETED" },
  });

  const stats = [
    { name: "Total Sales", value: totalSales.toString(), icon: "💰" },
    { name: "Today's Sales", value: todaySales.toString(), icon: "📊" },
    { name: "Total Revenue", value: `ETB ${(totalRevenue._sum.total || 0).toString()}`, icon: "💵" },
    { name: "Today's Revenue", value: `ETB ${(todayRevenue._sum.total || 0).toString()}`, icon: "🤑" },
    { name: "Total Jobs", value: totalJobs.toString(), icon: "🔧" },
    { name: "Pending Jobs", value: pendingJobs.toString(), icon: "⏳" },
    { name: "Completed Jobs", value: completedJobs.toString(), icon: "✅" },
    { name: "Customers", value: totalCustomers.toString(), icon: "👥" },
    { name: "Products", value: totalProducts.toString(), icon: "📦" },
    { name: "Low Stock Items", value: lowStock.toString(), icon: "⚠️" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{stat.icon}</span>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}