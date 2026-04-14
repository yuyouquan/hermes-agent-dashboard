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
import { useTranslation } from "@/lib/i18n/context";

interface StatsCardsProps {
  readonly stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { t } = useTranslation();

  const STAT_ITEMS = [
    { key: "totalJobs" as const, labelKey: "overview.totalJobs", icon: Briefcase },
    { key: "activeJobs" as const, labelKey: "overview.active", icon: Play },
    { key: "pausedJobs" as const, labelKey: "overview.paused", icon: Pause },
    { key: "completedJobs" as const, labelKey: "overview.completed", icon: CheckCircle2 },
    { key: "failedJobs" as const, labelKey: "overview.failed", icon: AlertCircle },
    { key: "upcomingToday" as const, labelKey: "overview.today", icon: Calendar },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {STAT_ITEMS.map(({ key, labelKey, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {t(labelKey)}
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
