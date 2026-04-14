"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HermesJob, JobStatus } from "@/lib/types";

interface RecentJobsProps {
  readonly jobs: readonly HermesJob[];
}

const STATUS_VARIANT: Record<JobStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  running: "default",
  completed: "secondary",
  failed: "destructive",
  paused: "outline",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  paused: "Paused",
};

function getJobStatus(job: HermesJob): JobStatus {
  if (job.paused) return "paused";
  if (!job.enabled) return "completed";
  if (job.last_run && !job.next_run) return "completed";
  if (job.next_run) return "pending";
  return "running";
}

export function RecentJobs({ jobs }: RecentJobsProps) {
  const recentJobs = [...jobs].slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        {recentJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No jobs found. Create a job in Hermes to see it here.
          </p>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => {
              const status = getJobStatus(job);
              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{job.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.schedule}
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
