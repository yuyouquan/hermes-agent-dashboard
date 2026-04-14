"use client";

import {
  Briefcase,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  readonly stats: DashboardStats;
}

const STAT_ITEMS = [
  { key: "totalJobs", label: "Total Jobs", icon: Briefcase },
  { key: "activeJobs", label: "Active", icon: Play },
  { key: "pausedJobs", label: "Paused", icon: Pause },
  { key: "completedJobs", label: "Completed", icon: CheckCircle2 },
  { key: "failedJobs", label: "Failed", icon: AlertCircle },
  { key: "upcomingToday", label: "Today", icon: Calendar },
] as const;

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
