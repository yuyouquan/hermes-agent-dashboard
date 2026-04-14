"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Copy,
  Check,
} from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import type { PromptTemplate } from "@/lib/types";

const STORAGE_KEY = "hermes.dashboard.prompts.v1";

function loadPrompts(): PromptTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePrompts(prompts: readonly PromptTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<readonly PromptTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => {
    setPrompts(loadPrompts());
  }, []);

  const persist = useCallback((next: readonly PromptTemplate[]) => {
    setPrompts(next);
    savePrompts(next);
  }, []);

  const handleCreate = () => {
    setEditing({
      id: crypto.randomUUID(),
      name: "",
      content: "",
      tags: [],
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    setEditorOpen(true);
  };

  const handleEdit = (p: PromptTemplate) => {
    setEditing(p);
    setEditorOpen(true);
  };

  const handleSave = () => {
    if (!editing || !editing.name.trim() || !editing.content.trim()) return;
    const updated = { ...editing, updated_at: Date.now() };
    const existing = prompts.find((p) => p.id === updated.id);
    const next = existing
      ? prompts.map((p) => (p.id === updated.id ? updated : p))
      : [...prompts, updated];
    persist(next);
    setEditorOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this prompt?")) return;
    persist(prompts.filter((p) => p.id !== id));
  };

  const handleCopy = (p: PromptTemplate) => {
    navigator.clipboard.writeText(p.content);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = debouncedSearch
    ? prompts.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.tags.some((t) =>
            t.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
      )
    : prompts;

  return (
    <div className="space-y-4 p-6">
      <p className="text-sm text-muted-foreground">
        Saved prompts for quick reuse. Stored in your browser — never sent to Hermes.
      </p>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          New Prompt
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            {prompts.length === 0
              ? "No prompts yet. Click 'New Prompt' to create one."
              : "No prompts match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleCopy(p)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="Copy"
                    >
                      {copiedId === p.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(p)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">
                  {p.content}
                </p>
                {p.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing && prompts.find((p) => p.id === editing.id)
                ? "Edit Prompt"
                : "New Prompt"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3 py-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Name</label>
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Content</label>
                <Textarea
                  value={editing.content}
                  onChange={(e) =>
                    setEditing({ ...editing, content: e.target.value })
                  }
                  className="min-h-[180px] text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Tags (comma separated)
                </label>
                <Input
                  value={editing.tags.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
