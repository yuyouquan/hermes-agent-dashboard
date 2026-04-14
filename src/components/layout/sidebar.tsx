"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  MessageSquare,
  History,
  Zap,
  BarChart3,
  Brain,
  Sparkles,
  FileText,
  Radio,
  FolderTree,
  FileCode,
  BookMarked,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthIndicator } from "@/components/dashboard/health-indicator";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

const NAV_ITEMS = [
  { href: "/", key: "overview", icon: LayoutDashboard },
  { href: "/kanban", key: "jobs", icon: Kanban },
  { href: "/chat", key: "chat", icon: MessageSquare },
  { href: "/runs", key: "runs", icon: Radio },
  { href: "/sessions", key: "sessions", icon: History },
  { href: "/analytics", key: "analytics", icon: BarChart3 },
  { href: "/skills", key: "skills", icon: Sparkles },
  { href: "/prompts", key: "prompts", icon: BookMarked },
  { href: "/memory", key: "memory", icon: Brain },
  { href: "/workspace", key: "workspace", icon: FolderTree },
  { href: "/config", key: "config", icon: FileCode },
  { href: "/credentials", key: "credentials", icon: Key },
  { href: "/logs", key: "logs", icon: FileText },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">{t("nav.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("nav.subtitle")}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-auto p-3">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-border p-4">
        <HealthIndicator />
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
