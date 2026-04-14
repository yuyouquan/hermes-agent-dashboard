"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGatewayStatus } from "@/lib/api";
import type { GatewayPlatformStatus } from "@/lib/types";

export function PlatformStatus() {
  const [platforms, setPlatforms] = useState<readonly GatewayPlatformStatus[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getGatewayStatus();
        setPlatforms(result);
      } catch {
        // Silent fail
      }
    };
    fetch();
    const interval = setInterval(fetch, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Platform Status</CardTitle>
      </CardHeader>
      <CardContent>
        {platforms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No platforms configured</p>
        ) : (
          <div className="space-y-2">
            {platforms.map((p) => (
              <div
                key={p.platform}
                className="flex items-center justify-between rounded-md border border-border p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      p.connected ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm font-medium capitalize">{p.platform}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {p.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
