"use client";

import {
  Briefcase,
  Play,
  Pause,
  MessageSquare,
  Coins,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  readonly stats: DashboardStats;
}

const STAT_ITEMS = [
  { key: "totalJobs", label: "Total Jobs", icon: Briefcase, format: "number" },
  { key: "activeJobs", label: "Active", icon: Play, format: "number" },
  { key: "pausedJobs", label: "Paused", icon: Pause, format: "number" },
  { key: "totalSessions", label: "Sessions", icon: MessageSquare, format: "number" },
  { key: "totalTokens", label: "Tokens Used", icon: Cpu, format: "compact" },
  { key: "totalCost", label: "Est. Cost", icon: Coins, format: "currency" },
] as const;

function formatValue(value: number, format: string): string {
  switch (format) {
    case "compact":
      return value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)}M`
        : value >= 1_000
          ? `${(value / 1_000).toFixed(1)}K`
          : value.toString();
    case "currency":
      return `$${value.toFixed(2)}`;
    default:
      return value.toString();
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {STAT_ITEMS.map(({ key, label, icon: Icon, format }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatValue(stats[key as keyof DashboardStats], format)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
