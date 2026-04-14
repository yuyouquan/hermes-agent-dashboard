"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { getCredentials } from "@/lib/api";
import type { CredentialEntry } from "@/lib/types";

export default function CredentialsPage() {
  const [entries, setEntries] = useState<readonly CredentialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState("");

  useEffect(() => {
    getCredentials()
      .then((result) => {
        setEntries(result.entries);
        setPath(result.path);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, CredentialEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.group) ?? [];
      arr.push(e);
      map.set(e.group, arr);
    }
    return [...map.entries()].sort((a, b) => {
      // "other" group last
      if (a[0] === "other") return 1;
      if (b[0] === "other") return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [entries]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const configured = entries.filter((e) => e.set).length;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-600 dark:text-blue-400">
        <Shield className="h-4 w-4 shrink-0" />
        <span>
          This view only shows which credentials are configured in{" "}
          <code>{path}</code>. Values are masked server-side — the dashboard
          never receives full secrets.
        </span>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Total Variables" value={entries.length.toString()} />
        <SummaryCard label="Configured" value={configured.toString()} tone="success" />
        <SummaryCard
          label="Unconfigured"
          value={(entries.length - configured).toString()}
          tone="muted"
        />
        <SummaryCard label="Providers" value={(groups.length).toString()} />
      </div>

      <div className="space-y-4">
        {groups.map(([group, groupEntries]) => (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm capitalize">
                <Key className="h-4 w-4 text-muted-foreground" />
                {group}
                <Badge variant="secondary" className="text-[10px]">
                  {groupEntries.filter((e) => e.set).length} / {groupEntries.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {groupEntries.map((entry) => (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between rounded border border-border p-2"
                  >
                    <div className="flex items-center gap-2">
                      {entry.set ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="font-mono text-xs">{entry.key}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {entry.set ? entry.masked : "(unset)"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  readonly label: string;
  readonly value: string;
  readonly tone?: "default" | "success" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-500"
      : tone === "muted"
        ? "text-muted-foreground"
        : "";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
