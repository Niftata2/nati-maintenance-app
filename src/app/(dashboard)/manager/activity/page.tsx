"use client";

import { useState, useEffect } from "react";
import { Search, Activity, Filter, User, Calendar, Package, CreditCard, Wrench, FileText } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  module: string;
  recordId?: string;
  details?: any;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = moduleFilter === "ALL"
        ? "/api/activity?limit=200"
        : `/api/activity?limit=200&module=${moduleFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.user.name.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q)
    );
  });

  const moduleIcon = (module: string) => {
    const m = module.toLowerCase();
    if (m.includes("job") || m.includes("repair")) return Wrench;
    if (m.includes("sale") || m.includes("pos")) return Package;
    if (m.includes("payment")) return CreditCard;
    if (m.includes("customer")) return User;
    if (m.includes("user") || m.includes("auth")) return User;
    return FileText;
  };

  const moduleColor = (module: string) => {
    const m = module.toLowerCase();
    if (m.includes("job") || m.includes("repair")) return "bg-blue-500/10 text-blue-500";
    if (m.includes("sale") || m.includes("pos")) return "bg-emerald-500/10 text-emerald-500";
    if (m.includes("payment")) return "bg-purple-500/10 text-purple-500";
    if (m.includes("customer")) return "bg-amber-500/10 text-amber-500";
    if (m.includes("user") || m.includes("auth")) return "bg-red-500/10 text-red-500";
    return "bg-zinc-500/10 text-zinc-400";
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      OWNER: "bg-purple-500/10 text-purple-500",
      CASHIER: "bg-blue-500/10 text-blue-500",
      TECHNICIAN: "bg-emerald-500/10 text-emerald-500",
    };
    return colors[role] || "bg-zinc-500/10 text-zinc-400";
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return new Date(date).toLocaleDateString();
  };

  const modules = ["ALL", ...Array.from(new Set(logs.map((l) => l.module)))];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Activity className="h-6 w-6" />
          Activity Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track everything that happens in your system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Total Events
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">{logs.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Today
          </p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {
              logs.filter(
                (l) =>
                  new Date(l.createdAt).toDateString() === new Date().toDateString()
              ).length
            }
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Last Event
          </p>
          <p className="text-sm font-medium text-foreground mt-2">
            {logs.length > 0 ? timeAgo(logs[0].createdAt) : "—"}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg mb-4 p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search by action, user, or module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {modules.map((m) => (
            <option key={m} value={m}>
              {m === "ALL" ? "All Modules" : m}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Activity className="mx-auto h-12 w-12 opacity-20 mb-3" />
            No activity yet
            <p className="text-xs mt-2">
              Actions like creating jobs, recording payments, and adding users will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const Icon = moduleIcon(log.module);
              return (
                <div key={log.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${moduleColor(log.module)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${moduleColor(log.module)}`}>
                          {log.module}
                        </span>
                        <span className="text-xs text-muted-foreground">by</span>
                        <span className="text-xs font-medium text-foreground">{log.user.name}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${roleBadge(log.user.role)}`}>
                          {log.user.role}
                        </span>
                        {log.recordId && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {log.recordId.slice(0, 8)}
                            </span>
                          </>
                        )}
                      </div>
                      {log.details && typeof log.details === "object" && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {JSON.stringify(log.details).slice(0, 120)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {timeAgo(log.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}