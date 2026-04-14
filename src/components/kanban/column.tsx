"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { KanbanColumn } from "@/lib/types";
import { JobCard } from "./card";

interface KanbanColumnViewProps {
  readonly column: KanbanColumn;
  readonly onAction: (action: string, jobId: string) => void;
}

const COLUMN_COLORS: Record<string, string> = {
  pending: "border-t-yellow-500",
  running: "border-t-blue-500",
  completed: "border-t-emerald-500",
  failed: "border-t-red-500",
  paused: "border-t-gray-400",
};

export function KanbanColumnView({ column, onAction }: KanbanColumnViewProps) {
  return (
    <div
      className={cn(
        "flex w-72 min-w-72 flex-col rounded-lg border border-border border-t-2 bg-card",
        COLUMN_COLORS[column.id]
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <Badge variant="secondary" className="text-xs">
          {column.jobs.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="space-y-2">
          {column.jobs.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              No tasks
            </p>
          ) : (
            column.jobs.map((job) => (
              <JobCard key={job.id} job={job} onAction={onAction} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
