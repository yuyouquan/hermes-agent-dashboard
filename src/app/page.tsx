"use client";

import { useMemo } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentJobs } from "@/components/dashboard/recent-jobs";
import { PlatformStatus } from "@/components/dashboard/platform-status";
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
        <PlatformStatus />
      </div>
    </div>
  );
}
