"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Bell, Search, X, CheckCircle2, Menu, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const role = session?.user?.role;
  const userName = session?.user?.name || "User";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setNotifications([]));
    }
  }, [showNotifications]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const getCurrentPageName = () => {
    if (pathname === "/manager" || pathname === "/manager/") return "Overview";
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
      : "Dashboard";
  };

  const currentPage = getCurrentPageName();

  const ownerLinks = [
    { name: "Dashboard", href: "/manager" },
    { name: "Customers", href: "/manager/customers" },
    { name: "Jobs", href: "/manager/jobs" },
    { name: "POS", href: "/pos" },
    { name: "Inventory", href: "/manager/inventory" },
    { name: "Payments", href: "/manager/payments" },
    { name: "Expenses", href: "/manager/expenses" },
    { name: "Reports", href: "/manager/reports" },
    { name: "Sales History", href: "/sales-history" },
    { name: "Activity Log", href: "/manager/activity" },
    { name: "Settings", href: "/manager/settings" },
  ];

  const cashierLinks = [
    { name: "Pending Payments", href: "/pending-payments" },
    { name: "POS", href: "/pos" },
    { name: "Sales History", href: "/sales-history" },
  ];

  const technicianLinks = [
    { name: "My Jobs", href: "/my-jobs" },
    { name: "Create Job", href: "/jobs/new" },
  ];

  const navLinks =
    role === "OWNER" ? ownerLinks :
    role === "CASHIER" ? cashierLinks :
    technicianLinks;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleColor = (r?: string) => {
    if (r === "OWNER") return "bg-purple-500/10 text-purple-500";
    if (r === "CASHIER") return "bg-blue-500/10 text-blue-500";
    return "bg-emerald-500/10 text-emerald-500";
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-3 md:px-6 sticky top-0 z-30">
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-md hover:bg-accent text-foreground shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="font-bold text-foreground hidden sm:inline shrink-0">
          Nati Maintenance
        </span>
        <span className="text-muted-foreground hidden sm:inline">/</span>
        <span className="text-muted-foreground font-medium truncate hidden sm:inline">
          {currentPage}
        </span>
        <span className="font-bold text-foreground sm:hidden truncate">
          {currentPage}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-48 lg:w-64 pl-9 bg-muted/50 border-border text-sm"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                <span className="text-sm font-semibold text-foreground">
                  Notifications
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={
                        "p-3 border-b border-border last:border-0 hover:bg-accent/50 " +
                        (n.read ? "opacity-60" : "")
                      }
                    >
                      <div className="flex gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 break-words">
                            {n.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition-colors"
            aria-label="User menu"
          >
            <div className="text-right hidden md:block">
              <div className="text-xs font-medium text-foreground leading-tight">
                {userName}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {role}
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20 shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
                <span
                  className={
                    "inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium " +
                    roleColor(role)
                  }
                >
                  {role}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full bg-background">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">
                Nati<span className="text-primary">.</span>
              </h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-border">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}