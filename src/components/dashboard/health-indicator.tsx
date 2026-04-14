"use client";

import { useHealthCheck } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function HealthIndicator() {
  const health = useHealthCheck();

  const statusConfig = {
    healthy: { color: "bg-emerald-500", label: "Connected" },
    unhealthy: { color: "bg-red-500", label: "Disconnected" },
    unknown: { color: "bg-yellow-500", label: "Checking..." },
  } as const;

  const config = statusConfig[health.status];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            config.color
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            config.color
          )}
        />
      </span>
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  );
}
