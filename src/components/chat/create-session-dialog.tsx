"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, ChevronRight, ArrowUp, Home, Loader2 } from "lucide-react";
import { useChatContext } from "@/lib/chat-context";
import { useTranslation } from "@/lib/i18n/context";
import { getWorkspaceTree } from "@/lib/api";

interface CreateSessionDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function CreateSessionDialog({
  open,
  onClose,
}: CreateSessionDialogProps) {
  const { createSession } = useChatContext();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [selectedDir, setSelectedDir] = useState("");
  const [browsePath, setBrowsePath] = useState("");
  const [dirs, setDirs] = useState<readonly { name: string }[]>([]);
  const [root, setRoot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getWorkspaceTree(browsePath)
      .then((tree) => {
        setDirs(tree.entries.filter((e) => e.is_dir));
        setRoot(tree.root);
        // Set initial selection to current browse path
        const fullPath = browsePath
          ? `${tree.root}/${browsePath}`
          : tree.root;
        setSelectedDir(fullPath);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, [open, browsePath]);

  const handleCreate = () => {
    if (!name.trim() || !selectedDir) return;
    createSession(name.trim(), selectedDir);
    setName("");
    setBrowsePath("");
    onClose();
  };

  const navigateInto = (dirName: string) => {
    const next = browsePath ? `${browsePath}/${dirName}` : dirName;
    setBrowsePath(next);
  };

  const navigateUp = () => {
    if (!browsePath) return;
    const parts = browsePath.split("/");
    parts.pop();
    setBrowsePath(parts.join("/"));
  };

  const selectDir = (dirName: string) => {
    const fullPath = browsePath
      ? `${root}/${browsePath}/${dirName}`
      : `${root}/${dirName}`;
    setSelectedDir(fullPath);
    setName((prev) => (prev ? prev : dirName));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setError(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("chat.newSession")}</DialogTitle>
          <DialogDescription>
            {t("chat.newSessionDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium">
              {t("chat.sessionName")}
            </label>
            <Input
              placeholder={t("chat.sessionNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">
              {t("chat.workdir")}
            </label>

            {/* Selected path display */}
            <div className="mb-2 rounded border border-border bg-muted px-3 py-1.5 font-mono text-xs">
              {selectedDir || "—"}
            </div>

            {/* Directory browser */}
            <div className="rounded border border-border">
              <div className="flex items-center gap-1 border-b border-border px-2 py-1">
                <button
                  onClick={() => setBrowsePath("")}
                  className="rounded p-1 hover:bg-accent"
                  title={t("workspace.tooltipRoot")}
                >
                  <Home className="h-3 w-3" />
                </button>
                <button
                  onClick={navigateUp}
                  disabled={!browsePath}
                  className="rounded p-1 hover:bg-accent disabled:opacity-30"
                  title={t("workspace.tooltipUp")}
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <span className="flex-1 truncate font-mono text-[10px] text-muted-foreground">
                  /{browsePath}
                </span>
              </div>
              <ScrollArea className="h-48">
                {loading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : dirs.length === 0 ? (
                  <p className="p-3 text-center text-xs text-muted-foreground">
                    {t("workspace.empty")}
                  </p>
                ) : (
                  <div className="p-1">
                    {dirs.map((d) => {
                      const fullPath = browsePath
                        ? `${root}/${browsePath}/${d.name}`
                        : `${root}/${d.name}`;
                      const isSelected = selectedDir === fullPath;
                      return (
                        <div
                          key={d.name}
                          className={`flex items-center gap-1 rounded px-2 py-1 text-xs cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent"
                          }`}
                          onClick={() => selectDir(d.name)}
                          onDoubleClick={() => navigateInto(d.name)}
                        >
                          <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                          <span className="flex-1 truncate">{d.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateInto(d.name);
                            }}
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {error && (
            <div className="rounded border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || !selectedDir}>
            {t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
