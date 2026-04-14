"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/kanban/board";
import { JobDetail } from "@/components/kanban/job-detail";
import { useHermesJobs } from "@/lib/hooks";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HermesJob } from "@/lib/types";

export default function KanbanPage() {
  const { jobs, loading, error, refetch } = useHermesJobs();
  const [selected, setSelected] = useState<HermesJob | null>(null);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
        </p>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <KanbanBoard jobs={jobs} onRefresh={refetch} onSelect={setSelected} />
      </div>

      <JobDetail
        job={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
