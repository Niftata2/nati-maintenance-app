"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Wrench,
  CreditCard,
  FileText,
  Plus,
  CheckCircle,
  ShoppingCart,
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";

const ownerNav = [
  { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
  { name: "Customers", href: "/manager/customers", icon: Users },
  { name: "Jobs", href: "/manager/jobs", icon: Wrench },
  { name: "Payments", href: "/manager/payments", icon: CreditCard },
  { name: "Reports", href: "/manager/reports", icon: FileText },
  { name: "Settings", href: "/manager/settings", icon: Settings },
];

const cashierNav = [
  { name: "Pending Payments", href: "/pending-payments", icon: CreditCard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Sales History", href: "/sales-history", icon: FileText },
];

const technicianNav = [
  { name: "My Jobs", href: "/my-jobs", icon: Wrench },
  { name: "Create Job", href: "/jobs/new", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const navigation =
    role === "OWNER" ? ownerNav :
    role === "CASHIER" ? cashierNav :
    technicianNav;

  return (
    <div className="flex h-full flex-col py-6 px-4">
      <div className="mb-8 px-4">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Nati<span className="text-emerald-500">.</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1 capitalize">
          {role ? role.toLowerCase() : ""}
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150 ease-out active:scale-95 cursor-pointer",
                isActive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}