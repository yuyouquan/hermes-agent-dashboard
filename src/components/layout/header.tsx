"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/kanban": "Jobs",
  "/chat": "Chat with Hermes",
  "/sessions": "Sessions",
  "/analytics": "Analytics",
  "/skills": "Skills",
  "/memory": "Memory",
  "/logs": "Logs",
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Hermes Dashboard";

  return (
    <header className="flex h-14 items-center border-b border-border px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
    </header>
  );
}
