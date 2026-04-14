"use client";

import { Play, Pause, RotateCcw, Trash2, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HermesJob } from "@/lib/types";

interface JobCardProps {
  readonly job: HermesJob;
  readonly onAction: (action: string, jobId: string) => void;
}

export function JobCard({ job, onAction }: JobCardProps) {
  return (
    <Card className="cursor-default transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="mb-2 flex items-start justify-between">
          <h4 className="text-sm font-medium leading-tight">{job.name}</h4>
        </div>

        <div className="mb-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{job.schedule}</span>
          </div>

          {job.skill && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span>{job.skill}</span>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {job.deliver && job.deliver !== "local" && (
            <div className="text-xs text-muted-foreground">
              Deliver: {job.deliver}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {job.paused ? (
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
            onClick={() => onAction("delete", job.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          {job.last_run && (
            <span className="ml-auto text-[10px] text-muted-foreground">
              Last: {new Date(job.last_run).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
