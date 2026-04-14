"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play, Radio, Clock } from "lucide-react";
import { listActiveRuns, createRun } from "@/lib/api";
import type { ActiveRun } from "@/lib/types";

interface RunEvent {
  readonly event: string;
  readonly timestamp: number;
  readonly tool?: string;
  readonly delta?: string;
  readonly output?: string;
  readonly error?: string;
  readonly preview?: string;
}

export default function RunsPage() {
  const [activeRuns, setActiveRuns] = useState<readonly ActiveRun[]>([]);
  const [maxConcurrent, setMaxConcurrent] = useState(10);
  const [prompt, setPrompt] = useState("");
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [events, setEvents] = useState<readonly RunEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchActive = useCallback(async () => {
    try {
      const result = await listActiveRuns();
      setActiveRuns(result.runs);
      setMaxConcurrent(result.max_concurrent);
    } catch {
      // Silent
    }
  }, []);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 2000);
    return () => clearInterval(interval);
  }, [fetchActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const handleRun = async () => {
    const text = prompt.trim();
    if (!text || running) return;
    setError(null);
    setRunning(true);
    setEvents([]);

    try {
      const { run_id } = await createRun(text);
      setCurrentRunId(run_id);

      const baseUrl =
        process.env.NEXT_PUBLIC_HERMES_API_URL ?? "http://localhost:8642";
      const res = await fetch(`${baseUrl}/v1/runs/${run_id}/events`);

      if (!res.ok) throw new Error(`events stream error ${res.status}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("no reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const data = line.slice(6).trim();
          if (!data) continue;
          try {
            const parsed = JSON.parse(data) as RunEvent;
            setEvents((prev) => [...prev, parsed]);
            if (
              parsed.event === "run.completed" ||
              parsed.event === "run.failed"
            ) {
              setRunning(false);
            }
          } catch {
            // Skip malformed
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setRunning(false);
    }
  };

  return (
    <div className="grid h-full gap-6 p-6 lg:grid-cols-3">
      {/* Left: active runs list */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4" />
              Active Runs
              <Badge variant="secondary">
                {activeRuns.length} / {maxConcurrent}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {activeRuns.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No runs in progress
              </p>
            ) : (
              activeRuns.map((r) => (
                <div
                  key={r.run_id}
                  className={`rounded-md border p-2 text-xs ${
                    r.run_id === currentRunId
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="font-mono truncate">{r.run_id}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {r.age_seconds.toFixed(0)}s · queue {r.queue_size}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: create + stream */}
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Run</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <Textarea
              placeholder="Enter a prompt to run with Hermes..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] text-sm"
              disabled={running}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Streams all tool calls and messages live via SSE.
              </p>
              <Button onClick={handleRun} disabled={running || !prompt.trim()}>
                {running ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-3.5 w-3.5" />
                    Run
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-1 flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Live Events</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[400px]">
              <div ref={scrollRef} className="space-y-1.5 pr-2">
                {events.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Run a prompt to see live events
                  </p>
                ) : (
                  events.map((ev, i) => <EventLine key={i} event={ev} />)
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const EVENT_COLORS: Record<string, string> = {
  "tool.started": "text-blue-400",
  "tool.completed": "text-emerald-400",
  "message.delta": "text-foreground",
  "run.completed": "text-emerald-500 font-semibold",
  "run.failed": "text-destructive font-semibold",
  "reasoning.available": "text-purple-400",
};

function EventLine({ event }: { readonly event: RunEvent }) {
  const color = EVENT_COLORS[event.event] ?? "text-muted-foreground";

  return (
    <div className="rounded border border-border/50 p-2 font-mono text-[11px]">
      <div className="mb-0.5 flex items-center gap-2">
        <span className={color}>{event.event}</span>
        <span className="text-[10px] text-muted-foreground">
          {new Date(event.timestamp * 1000).toLocaleTimeString()}
        </span>
        {event.tool && <span className="text-[10px]">{event.tool}</span>}
      </div>
      {event.delta && (
        <p className="whitespace-pre-wrap break-words text-foreground">
          {event.delta}
        </p>
      )}
      {event.preview && (
        <p className="whitespace-pre-wrap break-words text-muted-foreground">
          {event.preview}
        </p>
      )}
      {event.output && (
        <p className="whitespace-pre-wrap break-words text-emerald-400">
          {event.output}
        </p>
      )}
      {event.error && (
        <p className="whitespace-pre-wrap break-words text-destructive">
          {event.error}
        </p>
      )}
    </div>
  );
}
