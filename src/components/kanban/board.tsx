"use client";

import { useCallback } from "react";
import {
  type HermesJob,
  type JobStatus,
  type KanbanColumn,
  getJobStatus,
} from "@/lib/types";
import { KanbanColumnView } from "./column";
import { pauseJob, resumeJob, runJob, deleteJob } from "@/lib/api";

interface KanbanBoardProps {
  readonly jobs: readonly HermesJob[];
  readonly onRefresh: () => void;
  readonly onSelect: (job: HermesJob) => void;
}

const COLUMNS: readonly { id: JobStatus; title: string }[] = [
  { id: "pending", title: "Pending" },
  { id: "running", title: "Running" },
  { id: "completed", title: "Completed" },
  { id: "failed", title: "Failed" },
  { id: "paused", title: "Paused" },
];

export function KanbanBoard({ jobs, onRefresh, onSelect }: KanbanBoardProps) {
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
      } catch {
        // Swallow; user will see no state change
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
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
