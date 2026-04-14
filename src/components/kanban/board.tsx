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
import { useTranslation } from "@/lib/i18n/context";

interface KanbanBoardProps {
  readonly jobs: readonly HermesJob[];
  readonly onRefresh: () => void;
  readonly onSelect: (job: HermesJob) => void;
}

const COLUMN_IDS: readonly JobStatus[] = [
  "pending",
  "running",
  "completed",
  "failed",
  "paused",
];

export function KanbanBoard({ jobs, onRefresh, onSelect }: KanbanBoardProps) {
  const { t } = useTranslation();
  const columns: readonly KanbanColumn[] = COLUMN_IDS.map((id) => ({
    id,
    title: t(`jobs.${id}`),
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
