"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getManagerDashboardData } from "@/actions/dashboard";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Panel } from "@/components/shared/panel";
import { AttentionPanel } from "@/components/shared/attention-panel";
import { TechnicianActivityPanel } from "@/components/shared/technician-activity-panel";
import { RevenueChart } from "@/components/shared/revenue-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ManagerDashboardData, RecentJob, RecentActivityItem } from "../../../../domain/types/dashboard";
import { DashboardSkeleton } from "@/components/shared/dashboard-skeleton";

const REFRESH_INTERVAL_MS = 15000; // 15 seconds

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [counterKey, setCounterKey] = useState(0);

  const fetchData = useCallback(async (triggerCounter = false) => {
    try {
      const dashboardData = await getManagerDashboardData();
      setData(dashboardData);
      setLastUpdated(new Date());
      if (triggerCounter) {
        setCounterKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Refresh when tab regains focus
  useEffect(() => {
    const onFocus = () => fetchData(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      fetchData(true);
    });
  };

  if (!data) {
    return <DashboardSkeleton />;
  }

  const { summary, attentionItems, recentJobs, technicianActivity, recentActivity, revenueTrend } = data;

  return (
    <div className="space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Overview</h1>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[10px] md:text-xs font-medium text-emerald-500">Live</span>
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="text-emerald-500">•</span>
            <span className="text-emerald-500">Auto-refresh every 15s</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-card border border-border px-3 py-2 text-xs md:text-sm font-medium text-foreground hover:bg-accent transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
            <span className="hidden sm:inline">{isPending ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          key={`revenue-${counterKey}`}
          label="Today's Revenue"
          value={summary.todayRevenue}
          suffix=" ETB"
          hint={`${summary.todayPaymentCount} payments`}
          trend="up"
        />
        <StatCard
          key={`active-${counterKey}`}
          label="Active Jobs"
          value={summary.activeJobs}
          hint="Currently in workshop"
        />
        <StatCard
          key={`intake-${counterKey}`}
          label="Today's Intake"
          value={summary.todayJobs}
          hint="New devices received"
        />
        <StatCard
          key={`attention-${counterKey}`}
          label="Needs Attention"
          value={summary.needsAttentionCount}
          hint="Action required"
          trend="down"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Panel
            title="Revenue Trend (Last 14 Days)"
            action={
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCw className={cn("h-3 w-3", isPending && "animate-spin")} />
                Refresh
              </button>
            }
          >
            <RevenueChart data={revenueTrend} />
          </Panel>

          {attentionItems.length > 0 && (
            <Panel
              title="Needs Attention"
              action={<AlertCircle className="h-4 w-4 text-destructive" />}
            >
              <AttentionPanel items={attentionItems} />
            </Panel>
          )}

          <Panel
            title="Recent Jobs"
            action={
              <a href="/manager/jobs" className="text-xs text-primary hover:underline">
                View All
              </a>
            }
          >
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Job #</TableHead>
                    <TableHead className="text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-muted-foreground">Device</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                        No jobs yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentJobs.map((job: RecentJob) => (
                      <TableRow key={job.id} className="border-border/50 hover:bg-accent/50">
                        <TableCell className="font-mono text-sm text-foreground">
                          #{job.jobNumber}
                        </TableCell>
                        <TableCell className="text-foreground">{job.customerName}</TableCell>
                        <TableCell className="text-muted-foreground">{job.deviceName}</TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Panel>
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          <Panel title="Technician Workload">
            <TechnicianActivityPanel technicians={technicianActivity} />
          </Panel>

          <Panel title="Live Activity">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
            ) : (
              <ul className="space-y-4">
                {recentActivity.map((event: RecentActivityItem) => (
                  <li key={event.id} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm text-foreground leading-tight break-words">
                        {event.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.actorName} • {event.createdAt}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}