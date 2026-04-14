"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

export function Header() {
  const pathname = usePathname();
  const { dict } = useTranslation();
  const title =
    dict.headerTitles[pathname] ?? dict.headerTitles["/"] ?? "Dashboard";

  return (
    <header className="flex h-14 items-center border-b border-border px-6">
      <h2 className="text-lg font-semibold">{title}</h2>
    </header>
  );
}
