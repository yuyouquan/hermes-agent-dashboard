"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, Pause, Play } from "lucide-react";
import { tailLogs } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

type LogFile = "gateway" | "gateway_error" | "agent" | "errors";

const LEVEL_STYLES: Record<string, string> = {
  ERROR: "text-red-500",
  WARNING: "text-yellow-500",
  WARN: "text-yellow-500",
  INFO: "text-blue-400",
  DEBUG: "text-muted-foreground",
};

function detectLevel(line: string): string | null {
  const match = line.match(/\b(ERROR|WARNING|WARN|INFO|DEBUG)\b/);
  return match?.[1] ?? null;
}

export default function LogsPage() {
  const [file, setFile] = useState<LogFile>("gateway");
  const [lines, setLines] = useState<readonly string[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const { t } = useTranslation();

  const fetchLogs = useCallback(async () => {
    try {
      const result = await tailLogs(file, 500);
      setLines(result.lines);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    setLoading(true);
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [paused, fetchLogs]);

  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    autoScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  };

  const filtered = filter
    ? lines.filter((l) => l.toLowerCase().includes(filter.toLowerCase()))
    : lines;

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <Select value={file} onValueChange={(v) => v && setFile(v as LogFile)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gateway">gateway.log</SelectItem>
            <SelectItem value="gateway_error">gateway.error.log</SelectItem>
            <SelectItem value="agent">agent.log</SelectItem>
            <SelectItem value="errors">errors.log</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={t("logs.filterPlaceholder")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <>
              <Play className="mr-2 h-3.5 w-3.5" />
              {t("logs.resume")}
            </>
          ) : (
            <>
              <Pause className="mr-2 h-3.5 w-3.5" />
              {t("logs.pause")}
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          {t("common.refresh")}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="flex-1 overflow-hidden p-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-auto font-mono text-[11px] leading-relaxed"
        >
          {loading && lines.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {lines.length === 0 ? t("logs.noLines") : t("logs.noMatches")}
            </div>
          ) : (
            <div className="p-3">
              {filtered.map((line, i) => {
                const level = detectLevel(line);
                const color = level ? LEVEL_STYLES[level] : "";
                return (
                  <div
                    key={i}
                    className={`whitespace-pre-wrap break-words ${color}`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        {t("logs.linesInfo", { filtered: filtered.length, total: lines.length })}
        {paused && ` · ${t("logs.paused")}`}
      </p>
    </div>
  );
}
