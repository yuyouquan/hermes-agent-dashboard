"use client";

import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HermesJob } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";

interface JobCardProps {
  readonly job: HermesJob;
  readonly onAction: (action: string, jobId: string) => void;
  readonly onSelect: (job: HermesJob) => void;
}

export function JobCard({ job, onAction, onSelect }: JobCardProps) {
  const stopAction = (e: React.MouseEvent) => e.stopPropagation();

  const isPaused = job.state === "paused";

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md hover:border-primary/30"
      onClick={() => onSelect(job)}
    >
      <CardContent className="p-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 text-sm font-medium leading-tight">
            {job.name}
          </h4>
          {job.last_status === "error" && (
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          )}
          {job.last_status === "ok" && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          )}
        </div>

        <div className="mb-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.schedule_display}</span>
          </div>

          {job.next_run_at && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wide">Next</span>
              <span className="truncate">{formatRelativeTime(job.next_run_at)}</span>
            </div>
          )}

          {job.last_run_at && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wide">Last</span>
              <span className="truncate">{formatRelativeTime(job.last_run_at)}</span>
            </div>
          )}

          {job.origin?.platform && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3 shrink-0" />
              <span className="capitalize">{job.origin.platform}</span>
            </div>
          )}

          {job.repeat.times !== null && (
            <div className="text-[10px]">
              Runs: {job.repeat.completed} / {job.repeat.times}
            </div>
          )}
        </div>

        {job.last_error && (
          <div className="mb-2 rounded border border-destructive/30 bg-destructive/10 p-1.5 text-[10px] text-destructive line-clamp-2">
            {job.last_error}
          </div>
        )}

        <div className="flex items-center gap-1" onClick={stopAction}>
          {isPaused ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAction("resume", job.id)}
              title="Resume"
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAction("pause", job.id)}
              title="Pause"
            >
              <Pause className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAction("run", job.id)}
            title="Run now"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm(`Delete job "${job.name}"?`)) {
                onAction("delete", job.id);
              }
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
