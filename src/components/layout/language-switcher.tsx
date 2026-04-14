"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const toggle = () => setLocale(locale === "en" ? "zh" : "en");

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label={t("language.switchTo")}
      title={locale === "en" ? t("language.chinese") : t("language.english")}
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="uppercase">{locale}</span>
    </button>
  );
}
