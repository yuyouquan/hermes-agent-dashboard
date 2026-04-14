"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createJob } from "@/lib/api";

interface CreateJobDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: () => void;
}

const SCHEDULE_PRESETS: readonly { label: string; value: string }[] = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at 7:00 AM", value: "0 7 * * *" },
  { label: "Daily at 9:00 AM", value: "0 9 * * *" },
  { label: "Weekdays at 9 AM", value: "0 9 * * 1-5" },
  { label: "Weekly (Monday 9 AM)", value: "0 9 * * 1" },
  { label: "Monthly (1st at 9 AM)", value: "0 9 1 * *" },
];

const DELIVER_OPTIONS: readonly string[] = [
  "local",
  "origin",
  "feishu",
  "telegram",
  "discord",
  "slack",
];

export function CreateJobDialog({ open, onClose, onCreated }: CreateJobDialogProps) {
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("0 9 * * *");
  const [prompt, setPrompt] = useState("");
  const [deliver, setDeliver] = useState("local");
  const [repeat, setRepeat] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setSchedule("0 9 * * *");
    setPrompt("");
    setDeliver("local");
    setRepeat("");
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!schedule.trim()) {
      setError("Schedule is required");
      return;
    }
    if (!prompt.trim()) {
      setError("Prompt is required");
      return;
    }

    setSubmitting(true);
    try {
      const repeatObj = repeat ? { times: parseInt(repeat, 10) } : undefined;
      await createJob({
        name: name.trim(),
        schedule: schedule.trim(),
        prompt: prompt.trim(),
        deliver,
        ...(repeatObj ? { repeat: repeatObj } : {}),
      });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Cron Job</DialogTitle>
          <DialogDescription>
            Schedule a recurring task for Hermes to run automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium">Name</label>
            <Input
              placeholder="Daily news briefing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Schedule (cron expression)
            </label>
            <Select value={schedule} onValueChange={(v) => v && setSchedule(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label} ({p.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="mt-2 font-mono text-xs"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="0 9 * * *"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Prompt</label>
            <Textarea
              placeholder="What should Hermes do when this job runs?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] text-sm"
              maxLength={5000}
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              {prompt.length} / 5000
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium">Deliver to</label>
              <Select value={deliver} onValueChange={(v) => v && setDeliver(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVER_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium">
                Repeat (optional)
              </label>
              <Input
                type="number"
                min={1}
                placeholder="∞"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Create Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
