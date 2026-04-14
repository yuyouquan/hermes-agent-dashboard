"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MessageSquare,
  Cpu,
  Coins,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { HermesSession } from "@/lib/types";
import { getSessions } from "@/lib/api";
import { useDebounce } from "@/lib/hooks";
import { formatUnixRelative } from "@/lib/time";
import { SessionDetailDialog } from "./session-detail-dialog";

const PLATFORM_COLORS: Record<string, string> = {
  feishu: "bg-blue-500",
  telegram: "bg-sky-500",
  discord: "bg-indigo-500",
  slack: "bg-green-500",
  whatsapp: "bg-emerald-500",
  api_server: "bg-orange-500",
  cli: "bg-purple-500",
  gateway: "bg-pink-500",
};

export function SessionList() {
  const [sessions, setSessions] = useState<readonly HermesSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSessions({
        source: platformFilter === "all" ? undefined : platformFilter,
        limit: 100,
      });
      setSessions(result.sessions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  }, [platformFilter]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15_000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return sessions;
    const q = debouncedSearch.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.model?.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.user_id?.toLowerCase().includes(q)
    );
  }, [sessions, debouncedSearch]);

  const platforms = useMemo(() => {
    // Well-known platforms always visible to enable filtering
    const fixed = new Set(["feishu", "api_server", "cli", "telegram", "discord", "slack"]);
    for (const s of sessions) fixed.add(s.source);
    return Array.from(fixed).sort();
  }, [sessions]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, model, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={platformFilter}
            onValueChange={(v) => setPlatformFilter(v ?? "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && sessions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {sessions.length === 0
                  ? "No sessions found yet. Start a conversation to see it here."
                  : "No sessions match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="space-y-2 pr-2">
              {filtered.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSessionId(session.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <SessionDetailDialog
        sessionId={selectedSessionId}
        open={selectedSessionId !== null}
        onClose={() => setSelectedSessionId(null)}
      />
    </>
  );
}

function SessionCard({
  session,
  onClick,
}: {
  readonly session: HermesSession;
  readonly onClick: () => void;
}) {
  const isActive = !session.ended_at;
  const totalTokens =
    session.input_tokens +
    session.output_tokens +
    (session.reasoning_tokens ?? 0);
  const dotColor = PLATFORM_COLORS[session.source] ?? "bg-gray-400";

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:border-primary/30 hover:shadow-md ${
        isActive ? "border-blue-500/30" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
              <span className="text-[10px] font-mono uppercase text-muted-foreground">
                {session.source}
              </span>
              {isActive && (
                <Badge variant="default" className="text-[10px]">
                  Active
                </Badge>
              )}
            </div>
            <h4 className="mt-1 truncate text-sm font-medium">
              {session.title ??
                `Session ${session.id.slice(0, 12)}…`}
            </h4>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {session.message_count}
              </span>
              {session.tool_call_count > 0 && (
                <span>{session.tool_call_count} tools</span>
              )}
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {totalTokens.toLocaleString()}
              </span>
              {session.estimated_cost_usd !== null &&
                session.estimated_cost_usd > 0 && (
                  <span className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />${session.estimated_cost_usd.toFixed(4)}
                  </span>
                )}
              <span>{formatUnixRelative(session.started_at)}</span>
            </div>
            {session.model && (
              <p className="mt-1 truncate text-[10px] text-muted-foreground">
                {session.model}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
