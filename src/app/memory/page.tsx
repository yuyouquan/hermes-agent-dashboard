"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, FileText, Plus } from "lucide-react";
import { getMemory, updateMemory } from "@/lib/api";
import type { MemoryFile } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";

const TEMPLATES: Record<"MEMORY.md" | "USER.md", string> = {
  "MEMORY.md":
    "# Agent Memory\n\nDurable facts, preferences, and environment details the agent should remember across sessions.\n\n",
  "USER.md":
    "# About the User\n\nWho I am, my role, and how I prefer to work.\n\n",
};

export default function MemoryPage() {
  const [files, setFiles] = useState<readonly MemoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();

  const fetchMemory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMemory();
      setFiles(res);
      const next: Record<string, string> = {};
      for (const f of res) {
        if (f.content !== undefined) next[f.name] = f.content;
      }
      setEditing(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const handleSave = async (name: "MEMORY.md" | "USER.md") => {
    setSaving((s) => ({ ...s, [name]: true }));
    try {
      await updateMemory(name, editing[name] ?? "");
      await fetchMemory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving((s) => ({ ...s, [name]: false }));
    }
  };

  const createFile = (name: "MEMORY.md" | "USER.md") => {
    setEditing((e) => ({ ...e, [name]: TEMPLATES[name] }));
    setFiles((prev) =>
      prev.some((f) => f.name === name)
        ? prev
        : [...prev, { name, content: TEMPLATES[name] }]
    );
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filesByName = new Map(files.map((f) => [f.name, f]));
  const slots: ("MEMORY.md" | "USER.md")[] = ["MEMORY.md", "USER.md"];

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <p className="text-sm text-muted-foreground">{t("memory.intro")}</p>

      {slots.map((name) => {
        const file = filesByName.get(name);
        const exists = file !== undefined && file.content !== undefined;

        return (
          <Card key={name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{name}</CardTitle>
              </div>
              {exists ? (
                <Button
                  size="sm"
                  onClick={() => handleSave(name)}
                  disabled={saving[name]}
                >
                  {saving[name] ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-3.5 w-3.5" />
                  )}
                  {t("common.save")}
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => createFile(name)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  {t("common.create")}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {exists ? (
                <Textarea
                  value={editing[name] ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, [name]: e.target.value }))
                  }
                  className="min-h-[240px] font-mono text-xs"
                  placeholder={`# ${name}\n\nYour notes here...`}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("memory.noFile", { name })}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
