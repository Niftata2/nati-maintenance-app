"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Receipt, X, User, Banknote, CreditCard, Smartphone, Printer, Wrench } from "lucide-react";

export default function SalesHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/sales-history");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((it) => {
    const matchesSearch =
      it.reference.toLowerCase().includes(search.toLowerCase()) ||
      (it.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "ALL" || it.status === filter;
    const matchesType = typeFilter === "ALL" || it.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayItems = items.filter((s) => new Date(s.createdAt) >= today);
  const todayTotal = todayItems.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalAll = items.reduce((sum, s) => sum + Number(s.amount), 0);

  const statusStyle = (status: string) => {
    const styles: Record<string, { dot: string; label: string; color: string }> = {
      PAID: { dot: "bg-emerald-500", label: "Paid", color: "text-emerald-500" },
      PARTIALLY_PAID: { dot: "bg-amber-500", label: "Partial", color: "text-amber-500" },
      UNPAID: { dot: "bg-red-500", label: "Unpaid", color: "text-red-500" },
    };
    return styles[status] || { dot: "bg-zinc-400", label: status, color: "text-muted-foreground" };
  };

  const methodIcon = (method?: string) => {
    if (method === "CASH") return Banknote;
    if (method === "BANK_TRANSFER") return CreditCard;
    if (method === "MOBILE_MONEY" || method === "TELEBIRR") return Smartphone;
    return Banknote;
  };

  const methodLabel = (method?: string) => {
    if (method === "CASH") return "Cash";
    if (method === "BANK_TRANSFER") return "Bank";
    if (method === "MOBILE_MONEY") return "Mobile";
    if (method === "TELEBIRR") return "Telebirr";
    return method || "—";
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + " min ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + " hr" + (hrs > 1 ? "s" : "") + " ago";
    const days = Math.floor(hrs / 24);
    return days + " day" + (days > 1 ? "s" : "") + " ago";
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Sales History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All product sales and repair payments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Today
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{todayItems.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayTotal.toLocaleString()} ETB
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{items.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">records</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalAll.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">ETB</p>
          </div>
        </div>

        {/* Type filter */}
        <div className="bg-card border border-border rounded-lg mb-4 p-1 flex gap-1">
          {[
            { key: "ALL", label: "All Types" },
            { key: "SALE", label: "Product Sales" },
            { key: "REPAIR", label: "Repair Payments" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={
                "px-3 py-2 text-sm font-medium rounded-md transition-colors " +
                (typeFilter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="bg-card border border-border rounded-lg mb-4 p-1 flex gap-1">
          {[
            { key: "ALL", label: "All Status" },
            { key: "PAID", label: "Paid" },
            { key: "PARTIALLY_PAID", label: "Partial" },
            { key: "UNPAID", label: "Unpaid" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={
                "px-3 py-2 text-sm font-medium rounded-md transition-colors " +
                (filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-card border border-border rounded-lg mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search by reference or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-transparent border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No records found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Reference
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const s = statusStyle(item.status);
                  return (
                    <tr
                      key={item.type + "-" + item.id}
                      onClick={() => setSelected(item)}
                      className={
                        "border-b border-border last:border-0 cursor-pointer transition-colors " +
                        (selected?.id === item.id ? "bg-accent" : "hover:bg-accent/50")
                      }
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {item.type === "SALE" ? (
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium text-foreground">
                            {item.reference}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            "inline-block px-2 py-0.5 rounded text-xs font-medium " +
                            (item.type === "SALE"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-purple-500/10 text-purple-500")
                          }
                        >
                          {item.type === "SALE" ? "Sale" : "Repair"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {item.customerName || "Walk-in"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-sm">
                          <span className={"w-1.5 h-1.5 rounded-full " + s.dot}></span>
                          <span className={s.color + " font-medium"}>{s.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-foreground text-right">
                        {Number(item.amount).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-muted-foreground">
                        {timeAgo(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div className="w-[420px] bg-card border-l border-border fixed right-0 top-0 h-screen overflow-y-auto z-20 shadow-xl">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between sticky top-0 bg-card z-10">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {selected.type === "SALE" ? "Sale Invoice" : "Repair Job"}
              </p>
              <h2 className="text-base font-bold text-foreground">{selected.reference}</h2>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-6 border-b border-border text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Total Amount
            </p>
            <p className="text-3xl font-bold text-foreground">
              {Number(selected.amount).toLocaleString()} ETB
            </p>
            <div className="mt-3">
              <span
                className={
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium " +
                  (selected.status === "PAID"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : selected.status === "PARTIALLY_PAID"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-red-500/10 text-red-500")
                }
              >
                <span
                  className={"w-1.5 h-1.5 rounded-full " + statusStyle(selected.status).dot}
                ></span>
                {statusStyle(selected.status).label}
              </span>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Customer
            </h3>
            <div className="flex items-center gap-2 text-sm text-foreground font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              {selected.customerName || "Walk-in"}
            </div>
            {selected.customerPhone && (
              <p className="text-xs text-muted-foreground ml-6 mt-1">
                {selected.customerPhone}
              </p>
            )}
          </div>

          {selected.type === "SALE" && selected.items?.length > 0 && (
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Items ({selected.items.length})
              </h3>
              <div className="space-y-2">
                {selected.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-background border border-border rounded-md px-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {Number(item.unitPrice).toLocaleString()} ETB
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground ml-2">
                      {Number(item.total).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.type === "REPAIR" && (
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Device
              </h3>
              <p className="text-sm text-foreground font-medium">{selected.deviceName}</p>
              {selected.problem && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-1">
                    Problem
                  </p>
                  <p className="text-sm text-foreground">{selected.problem}</p>
                </>
              )}
              {selected.diagnosis && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-1">
                    Diagnosis
                  </p>
                  <p className="text-sm text-foreground">{selected.diagnosis}</p>
                </>
              )}
            </div>
          )}

          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Payment Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">
                  {Number(selected.amount).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="text-sm font-medium text-emerald-500">
                  {Number(selected.paidAmount).toLocaleString()} ETB
                </span>
              </div>
              {Number(selected.remainingAmount) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <span className="text-sm font-medium text-amber-500">
                    {Number(selected.remainingAmount).toLocaleString()} ETB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cashier</span>
                <span className="text-sm text-foreground">{selected.cashier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="text-sm text-foreground">
                  {methodLabel(selected.method)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm text-foreground">
                  {new Date(selected.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {selected.type === "SALE" && (
            <div className="px-5 py-4 sticky bottom-0 bg-card border-t border-border">
              <Link
                href={"/receipts/" + selected.id}
                className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                View Receipt / Print
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}