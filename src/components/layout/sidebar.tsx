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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthIndicator } from "@/components/dashboard/health-indicator";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/kanban", label: "Jobs", icon: Kanban },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/runs", label: "Runs", icon: Radio },
  { href: "/sessions", label: "Sessions", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/prompts", label: "Prompts", icon: BookMarked },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/workspace", label: "Workspace", icon: FolderTree },
  { href: "/config", label: "Config", icon: FileCode },
  { href: "/logs", label: "Logs", icon: FileText },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">Hermes Agent</h1>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <HealthIndicator />
      </div>
    </aside>
  );
}
