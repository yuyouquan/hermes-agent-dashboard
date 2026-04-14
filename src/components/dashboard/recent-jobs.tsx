"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { type HermesJob, type JobStatus, getJobStatus } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";
import { useTranslation } from "@/lib/i18n/context";

interface RecentJobsProps {
  readonly jobs: readonly HermesJob[];
}

const STATUS_VARIANT: Record<
  JobStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  running: "default",
  completed: "secondary",
  failed: "destructive",
  paused: "outline",
};

export function RecentJobs({ jobs }: RecentJobsProps) {
  const { t } = useTranslation();
  const STATUS_LABEL: Record<JobStatus, string> = {
    pending: t("jobs.pending"),
    running: t("jobs.running"),
    completed: t("jobs.completed"),
    failed: t("jobs.failed"),
    paused: t("jobs.paused"),
  };
  const recentJobs = [...jobs]
    .sort((a, b) => {
      const aTime = a.last_run_at ?? a.next_run_at ?? a.created_at;
      const bTime = b.last_run_at ?? b.next_run_at ?? b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("overview.recentJobs")}</CardTitle>
      </CardHeader>
      <CardContent>
        {recentJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("overview.noJobs")}</p>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => {
              const status = getJobStatus(job);
              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{job.name}</p>
                      {job.last_status === "ok" && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      )}
                      {job.last_status === "error" && (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.schedule_display}
                      {job.next_run_at && ` · next ${formatRelativeTime(job.next_run_at)}`}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[status]}>
                    {STATUS_LABEL[status]}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
