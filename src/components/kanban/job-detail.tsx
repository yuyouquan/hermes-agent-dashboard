"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { HermesJob, JobState } from "@/lib/types";
import { formatDateTime, formatRelativeTime } from "@/lib/time";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface JobDetailProps {
  readonly job: HermesJob | null;
  readonly open: boolean;
  readonly onClose: () => void;
}

const STATE_VARIANT: Record<JobState, "default" | "secondary" | "outline"> = {
  scheduled: "default",
  paused: "outline",
  completed: "secondary",
};

export function JobDetail({ job, open, onClose }: JobDetailProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {job && (
          <>
            <SheetHeader>
              <SheetTitle className="text-left">{job.name}</SheetTitle>
              <SheetDescription className="text-left font-mono text-xs">
                {job.id}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="mt-4 h-[calc(100vh-8rem)] pr-4">
              <div className="space-y-5">
                {/* Status row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={STATE_VARIANT[job.state]}>{job.state}</Badge>
                  {job.enabled ? (
                    <Badge variant="secondary">enabled</Badge>
                  ) : (
                    <Badge variant="outline">disabled</Badge>
                  )}
                  {job.last_status === "ok" && (
                    <Badge className="bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Last: OK
                    </Badge>
                  )}
                  {job.last_status === "error" && (
                    <Badge variant="destructive">
                      <AlertCircle className="mr-1 h-3 w-3" /> Last: Error
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Schedule */}
                <Section title="Schedule">
                  <KV label="Type" value={job.schedule.kind} />
                  <KV label="Display" value={job.schedule_display} mono />
                  {job.next_run_at && (
                    <KV
                      label="Next run"
                      value={`${formatDateTime(job.next_run_at)} (${formatRelativeTime(job.next_run_at)})`}
                    />
                  )}
                  {job.last_run_at && (
                    <KV
                      label="Last run"
                      value={`${formatDateTime(job.last_run_at)} (${formatRelativeTime(job.last_run_at)})`}
                    />
                  )}
                  <KV
                    label="Repeat"
                    value={
                      job.repeat.times === null
                        ? `∞ (${job.repeat.completed} completed)`
                        : `${job.repeat.completed} / ${job.repeat.times}`
                    }
                  />
                  <KV label="Created" value={formatDateTime(job.created_at)} />
                </Section>

                {/* Paused info */}
                {job.state === "paused" && (
                  <>
                    <Separator />
                    <Section title="Pause Info">
                      <KV label="Paused at" value={formatDateTime(job.paused_at)} />
                      {job.paused_reason && (
                        <KV label="Reason" value={job.paused_reason} />
                      )}
                    </Section>
                  </>
                )}

                {/* Errors */}
                {(job.last_error || job.last_delivery_error) && (
                  <>
                    <Separator />
                    <Section title="Errors">
                      {job.last_error && (
                        <div className="rounded border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                          <div className="mb-1 font-semibold">Last error</div>
                          <pre className="whitespace-pre-wrap break-words">
                            {job.last_error}
                          </pre>
                        </div>
                      )}
                      {job.last_delivery_error && (
                        <div className="mt-2 rounded border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                          <div className="mb-1 font-semibold">Delivery error</div>
                          <pre className="whitespace-pre-wrap break-words">
                            {job.last_delivery_error}
                          </pre>
                        </div>
                      )}
                    </Section>
                  </>
                )}

                <Separator />

                {/* Delivery */}
                <Section title="Delivery">
                  <KV label="Target" value={job.deliver} />
                  {job.origin && (
                    <>
                      <KV label="Platform" value={job.origin.platform} />
                      {job.origin.chat_name && (
                        <KV label="Chat" value={job.origin.chat_name} />
                      )}
                      {job.origin.chat_id && (
                        <KV label="Chat ID" value={job.origin.chat_id} mono />
                      )}
                    </>
                  )}
                </Section>

                {/* Model overrides */}
                {(job.model || job.provider || job.base_url) && (
                  <>
                    <Separator />
                    <Section title="Model Overrides">
                      {job.model && <KV label="Model" value={job.model} />}
                      {job.provider && <KV label="Provider" value={job.provider} />}
                      {job.base_url && (
                        <KV label="Base URL" value={job.base_url} mono />
                      )}
                    </Section>
                  </>
                )}

                {/* Skills */}
                {(job.skills.length > 0 || job.skill) && (
                  <>
                    <Separator />
                    <Section title="Skills">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.map((s) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                        {job.skill && !job.skills.includes(job.skill) && (
                          <Badge variant="outline">{job.skill}</Badge>
                        )}
                      </div>
                    </Section>
                  </>
                )}

                {/* Prompt */}
                {job.prompt && (
                  <>
                    <Separator />
                    <Section title="Prompt">
                      <pre className="whitespace-pre-wrap rounded border border-border bg-muted p-3 text-xs font-mono">
                        {job.prompt}
                      </pre>
                    </Section>
                  </>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function KV({
  label,
  value,
  mono = false,
}: {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly mono?: boolean;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={mono ? "break-all text-right font-mono" : "break-words text-right"}>
        {value}
      </span>
    </div>
  );
}
