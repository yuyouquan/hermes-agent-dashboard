"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { DICTIONARIES, type Dictionary, type Locale } from "./dictionaries";

const STORAGE_KEY = "hermes.dashboard.locale";

interface I18nContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
  readonly t: (path: string, vars?: Record<string, string | number>) => string;
  readonly dict: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "zh") return stored;
  // Auto-detect browser language
  const nav = navigator.language || navigator.languages?.[0] || "en";
  return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
}

/**
 * Lookup a nested dict path like "nav.overview" or "jobs.createDialog.title".
 * Returns the path itself if missing so misses are obvious.
 */
function lookup(dict: Dictionary, path: string): string {
  const parts = path.split(".");
  let node: unknown = dict;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return path;
    node = (node as Record<string, unknown>)[part];
    if (node === undefined) return path;
  }
  return typeof node === "string" ? node : path;
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}

export function I18nProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(resolveInitialLocale());
    setHydrated(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    }
  }, []);

  const dict = DICTIONARIES[locale];

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      return interpolate(lookup(dict, path), vars);
    },
    [dict]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, dict }),
    [locale, setLocale, t, dict]
  );

  // Before hydration, render with default so SSR markup is consistent.
  // After hydration, actual locale takes effect.
  if (!hydrated) {
    return (
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { t, locale, dict } = useI18n();
  return { t, locale, dict };
}
