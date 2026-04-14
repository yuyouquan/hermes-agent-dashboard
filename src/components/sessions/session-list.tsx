"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, MessageSquare, Cpu, Clock, Coins } from "lucide-react";
import type { HermesSession, Platform } from "@/lib/types";
import { getSessions } from "@/lib/api";
import { useDebounce } from "@/lib/hooks";

const PLATFORM_COLORS: Partial<Record<Platform, string>> = {
  local: "bg-gray-500",
  telegram: "bg-blue-500",
  discord: "bg-indigo-500",
  slack: "bg-green-500",
  api: "bg-orange-500",
};

export function SessionList() {
  const [sessions, setSessions] = useState<readonly HermesSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await getSessions();
        setSessions(data);
      } catch {
        // Sessions API may not be available yet
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filtered = sessions.filter((session) => {
    const matchesSearch =
      !debouncedSearch ||
      session.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      session.model.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      session.id.includes(debouncedSearch);

    const matchesPlatform =
      platformFilter === "all" || session.source === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  const platforms = Array.from(new Set(sessions.map((s) => s.source)));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading sessions...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {sessions.length === 0
                  ? "No sessions found. Sessions will appear here once Hermes starts processing requests."
                  : "No sessions match your filters."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-3">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function SessionCard({
  session,
}: {
  readonly session: HermesSession;
}) {
  const isActive = !session.ended_at;
  const totalTokens =
    session.input_tokens + session.output_tokens + session.reasoning_tokens;

  return (
    <Card className={isActive ? "border-blue-500/30" : undefined}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-medium">
                {session.title ?? `Session ${session.id.slice(0, 8)}`}
              </h4>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="text-[10px]"
              >
                {isActive ? "Active" : "Ended"}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span
                  className={`h-2 w-2 rounded-full ${PLATFORM_COLORS[session.source] ?? "bg-gray-400"}`}
                />
                {session.source}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {session.message_count} msgs
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {totalTokens.toLocaleString()} tokens
              </span>
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                ${session.estimated_cost_usd.toFixed(3)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(session.started_at).toLocaleString()}
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Model: {session.model}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
