"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Coins, Cpu, MessageSquare, Layers } from "lucide-react";
import { getSessions } from "@/lib/api";
import type { HermesSession } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<readonly HermesSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const result = await getSessions({ limit: 500 });
        setSessions(result.sessions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const now = Date.now() / 1000;
    const dayAgo = now - 24 * 3600;
    const weekAgo = now - 7 * 24 * 3600;
    const monthAgo = now - 30 * 24 * 3600;

    let totalTokens = 0;
    let totalCost = 0;
    let todayTokens = 0;
    let weekTokens = 0;
    let monthTokens = 0;
    let todayCost = 0;
    let weekCost = 0;
    let monthCost = 0;

    const byPlatform = new Map<string, { sessions: number; tokens: number; cost: number }>();
    const byModel = new Map<string, { sessions: number; tokens: number; cost: number }>();
    const byProvider = new Map<string, { sessions: number; tokens: number; cost: number }>();

    for (const s of sessions) {
      const tokens = s.input_tokens + s.output_tokens + (s.reasoning_tokens ?? 0);
      const cost = s.estimated_cost_usd ?? 0;
      totalTokens += tokens;
      totalCost += cost;

      if (s.started_at >= dayAgo) {
        todayTokens += tokens;
        todayCost += cost;
      }
      if (s.started_at >= weekAgo) {
        weekTokens += tokens;
        weekCost += cost;
      }
      if (s.started_at >= monthAgo) {
        monthTokens += tokens;
        monthCost += cost;
      }

      const addTo = (
        map: Map<string, { sessions: number; tokens: number; cost: number }>,
        key: string
      ) => {
        const existing = map.get(key) ?? { sessions: 0, tokens: 0, cost: 0 };
        map.set(key, {
          sessions: existing.sessions + 1,
          tokens: existing.tokens + tokens,
          cost: existing.cost + cost,
        });
      };

      addTo(byPlatform, s.source);
      if (s.model) addTo(byModel, s.model);
      if (s.billing_provider) addTo(byProvider, s.billing_provider);
    }

    return {
      totalSessions: sessions.length,
      totalTokens,
      totalCost,
      todayTokens,
      weekTokens,
      monthTokens,
      todayCost,
      weekCost,
      monthCost,
      byPlatform: [...byPlatform.entries()].sort((a, b) => b[1].tokens - a[1].tokens),
      byModel: [...byModel.entries()].sort((a, b) => b[1].tokens - a[1].tokens),
      byProvider: [...byProvider.entries()].sort((a, b) => b[1].tokens - a[1].tokens),
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatTokens = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1)}K`
        : n.toString();

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Time-window cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TimeWindowCard label={t("analytics.today")} tokens={stats.todayTokens} cost={stats.todayCost} />
        <TimeWindowCard label={t("analytics.days7")} tokens={stats.weekTokens} cost={stats.weekCost} />
        <TimeWindowCard label={t("analytics.days30")} tokens={stats.monthTokens} cost={stats.monthCost} />
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label={t("analytics.totalSessions")}
          value={stats.totalSessions.toString()}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <SummaryCard
          label={t("analytics.totalTokens")}
          value={formatTokens(stats.totalTokens)}
          icon={<Cpu className="h-4 w-4" />}
        />
        <SummaryCard
          label={t("analytics.totalCost")}
          value={`$${stats.totalCost.toFixed(3)}`}
          icon={<Coins className="h-4 w-4" />}
        />
        <SummaryCard
          label={t("analytics.platforms")}
          value={stats.byPlatform.length.toString()}
          icon={<Layers className="h-4 w-4" />}
        />
      </div>

      {/* Breakdown tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        <BreakdownCard
          title={t("analytics.byPlatform")}
          data={stats.byPlatform}
          totalTokens={stats.totalTokens}
          emptyLabel={t("analytics.noDataShort")}
        />
        <BreakdownCard
          title={t("analytics.byModel")}
          data={stats.byModel}
          totalTokens={stats.totalTokens}
          emptyLabel={t("analytics.noDataShort")}
        />
        <BreakdownCard
          title={t("analytics.byProvider")}
          data={stats.byProvider}
          totalTokens={stats.totalTokens}
          emptyLabel={t("analytics.noDataShort")}
        />
      </div>
    </div>
  );
}

function TimeWindowCard({
  label,
  tokens,
  cost,
}: {
  readonly label: string;
  readonly tokens: number;
  readonly cost: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{tokens.toLocaleString()} tokens</div>
        <p className="text-sm text-muted-foreground">${cost.toFixed(4)}</p>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  readonly label: string;
  readonly value: string;
  readonly icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title,
  data,
  totalTokens,
  emptyLabel,
}: {
  readonly title: string;
  readonly data: readonly [string, { sessions: number; tokens: number; cost: number }][];
  readonly totalTokens: number;
  readonly emptyLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 10).map(([key, v]) => {
              const pct = totalTokens > 0 ? (v.tokens / totalTokens) * 100 : 0;
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{key}</span>
                    <span className="text-muted-foreground">
                      {v.tokens.toLocaleString()} · ${v.cost.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
