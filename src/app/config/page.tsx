"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileCode, AlertCircle } from "lucide-react";
import { getConfig } from "@/lib/api";
import type { ConfigContent } from "@/lib/types";

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          This view is <strong>read-only</strong>. Secret fields (API keys,
          tokens) are masked server-side. Edit <code>~/.hermes/config.yaml</code>{" "}
          directly to make changes, then restart the gateway.
        </span>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {config && (
        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <p className="flex-1 truncate font-mono text-xs">{config.path}</p>
            {config.size !== undefined && (
              <span className="text-xs text-muted-foreground">
                {(config.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>
          <ScrollArea className="flex-1">
            <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-relaxed">
              {config.content || "(empty file)"}
            </pre>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
