"use client";

import { useMemo } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { useHermesJobs } from "@/lib/hooks";
import { getJobStatus, type DashboardStats } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function OverviewPage() {
  const { jobs, loading, error } = useHermesJobs();

  const stats: DashboardStats = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    let activeJobs = 0;
    let pausedJobs = 0;
    let completedJobs = 0;
    let failedJobs = 0;
    let upcomingToday = 0;

    for (const job of jobs) {
      const status = getJobStatus(job);
      if (status === "paused") pausedJobs++;
      else if (status === "completed") completedJobs++;
      else if (status === "failed") failedJobs++;
      else if (job.enabled) activeJobs++;

      if (job.next_run_at) {
        const next = new Date(job.next_run_at);
        if (next >= todayStart && next < todayEnd) upcomingToday++;
      }
    }

    return {
      totalJobs: jobs.length,
      activeJobs,
      pausedJobs,
      completedJobs,
      failedJobs,
      upcomingToday,
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
              1. Make sure Hermes Agent gateway is running with the API server enabled.
            </p>
            <p>
              2. Visit the <strong>Kanban</strong> page to manage cron jobs — pause,
              resume, run immediately, or view detailed status & error history.
            </p>
            <p>
              3. Click any job card to see the full prompt, schedule details, last
              run error messages, and delivery target.
            </p>
            <p>
              4. Use <strong>Chat</strong> to send messages to Hermes directly from
              the browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
