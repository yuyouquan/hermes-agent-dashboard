"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Loader2, Search, Sparkles } from "lucide-react";
import { getSkills, getSkill } from "@/lib/api";
import type { HermesSkill } from "@/lib/types";
import { useDebounce } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n/context";

export default function SkillsPage() {
  const [skills, setSkills] = useState<readonly HermesSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selected, setSelected] = useState<HermesSkill | null>(null);
  const [detailContent, setDetailContent] = useState<string>("");
  const [detailLoading, setDetailLoading] = useState(false);
  const { t } = useTranslation();

  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getSkills();
        setSkills(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetailContent("");
      return;
    }
    setDetailLoading(true);
    getSkill(selected.id)
      .then(setDetailContent)
      .catch((err) =>
        setDetailContent(
          `Error loading skill: ${err instanceof Error ? err.message : "unknown"}`
        )
      )
      .finally(() => setDetailLoading(false));
  }, [selected]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of skills) set.add(s.category || "uncategorized");
    return Array.from(set).sort();
  }, [skills]);

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      if (categoryFilter !== "all" && (s.category || "uncategorized") !== categoryFilter) {
        return false;
      }
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });
  }, [skills, debouncedSearch, categoryFilter]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("skills.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} / {skills.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={categoryFilter === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setCategoryFilter("all")}
        >
          {t("skills.allCategories")}
        </Badge>
        {categories.map((c) => (
          <Badge
            key={c}
            variant={categoryFilter === c ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setCategoryFilter(c)}
          >
            {c}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skill) => (
          <Card
            key={skill.id}
            className="cursor-pointer transition-shadow hover:border-primary/30 hover:shadow-md"
            onClick={() => setSelected(skill)}
          >
            <CardContent className="p-4">
              <div className="mb-2 flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{skill.name}</h3>
                  <p className="truncate text-[10px] font-mono text-muted-foreground">
                    {skill.id}
                  </p>
                </div>
              </div>
              <p className="line-clamp-3 text-xs text-muted-foreground">
                {skill.description || t("skills.noDescription")}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {skill.category && (
                  <Badge variant="secondary" className="text-[10px]">
                    {skill.category}
                  </Badge>
                )}
                {skill.version && (
                  <span className="text-[10px] text-muted-foreground">
                    v{skill.version}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={selected !== null} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="w-full overflow-hidden sm:max-w-2xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{selected.name}</SheetTitle>
                <SheetDescription className="text-left font-mono text-xs">
                  {selected.id}
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="mt-4 h-[calc(100vh-10rem)] pr-4">
                {detailLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                    {detailContent}
                  </pre>
                )}
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
