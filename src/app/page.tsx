"use client";

import { useMemo } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { useHermesJobs } from "@/lib/hooks";
import type { DashboardStats } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function OverviewPage() {
  const { jobs, loading, error } = useHermesJobs();

  const stats: DashboardStats = useMemo(() => {
    const activeJobs = jobs.filter((j) => j.enabled && !j.paused).length;
    const pausedJobs = jobs.filter((j) => j.paused).length;
    return {
      totalJobs: jobs.length,
      activeJobs,
      pausedJobs,
      totalSessions: 0,
      totalTokens: 0,
      totalCost: 0,
    };
  }, [jobs]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}. Make sure Hermes is running and the API URL is configured.
        </div>
      )}

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentJobs jobs={jobs} />
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-base font-semibold">Quick Start</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              1. Make sure your Hermes Agent is running with the API server
              enabled.
            </p>
            <p>
              2. Set <code className="rounded bg-muted px-1.5 py-0.5 text-xs">NEXT_PUBLIC_HERMES_API_URL</code> in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.local</code> if
              Hermes is not at localhost:8642.
            </p>
            <p>
              3. Use the <strong>Kanban</strong> tab to see all scheduled jobs
              organized by status.
            </p>
            <p>
              4. Use the <strong>Chat</strong> tab to interact with Hermes
              directly.
            </p>
            <p>
              5. Use the <strong>Sessions</strong> tab to browse conversation
              history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
