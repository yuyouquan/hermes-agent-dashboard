"use client";

import { useCallback } from "react";
import type { HermesJob, JobStatus, KanbanColumn } from "@/lib/types";
import { KanbanColumnView } from "./column";
import { pauseJob, resumeJob, runJob, deleteJob } from "@/lib/api";

interface KanbanBoardProps {
  readonly jobs: readonly HermesJob[];
  readonly onRefresh: () => void;
}

function getJobStatus(job: HermesJob): JobStatus {
  if (job.paused) return "paused";
  if (!job.enabled) return "completed";
  if (job.last_run && !job.next_run) return "completed";
  if (job.next_run) return "pending";
  return "running";
}

const COLUMNS: readonly { id: JobStatus; title: string }[] = [
  { id: "pending", title: "Pending" },
  { id: "running", title: "Running" },
  { id: "completed", title: "Completed" },
  { id: "failed", title: "Failed" },
  { id: "paused", title: "Paused" },
];

export function KanbanBoard({ jobs, onRefresh }: KanbanBoardProps) {
  const columns: readonly KanbanColumn[] = COLUMNS.map(({ id, title }) => ({
    id,
    title,
    jobs: jobs.filter((job) => getJobStatus(job) === id),
  }));

  const handleAction = useCallback(
    async (action: string, jobId: string) => {
      try {
        switch (action) {
          case "pause":
            await pauseJob(jobId);
            break;
          case "resume":
            await resumeJob(jobId);
            break;
          case "run":
            await runJob(jobId);
            break;
          case "delete":
            await deleteJob(jobId);
            break;
        }
        onRefresh();
      } catch (err) {
        // Error is visible in network tab; could add toast later
      }
    },
    [onRefresh]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumnView
          key={column.id}
          column={column}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}
