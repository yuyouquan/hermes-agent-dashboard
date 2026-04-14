"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File as FileIcon,
  ArrowUp,
  Home,
} from "lucide-react";
import { getWorkspaceTree, getWorkspaceFile } from "@/lib/api";
import type { WorkspaceTree, WorkspaceFile } from "@/lib/types";

export default function WorkspacePage() {
  const [currentPath, setCurrentPath] = useState("");
  const [tree, setTree] = useState<WorkspaceTree | null>(null);
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getWorkspaceTree(currentPath)
      .then((t) => {
        setTree(t);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, [currentPath]);

  const handleEntryClick = (name: string, isDir: boolean) => {
    const newPath = currentPath ? `${currentPath}/${name}` : name;
    if (isDir) {
      setCurrentPath(newPath);
      setSelectedFile(null);
    } else {
      setFileLoading(true);
      setSelectedFile(null);
      getWorkspaceFile(newPath)
        .then(setSelectedFile)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
        .finally(() => setFileLoading(false));
    }
  };

  const goUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
    setSelectedFile(null);
  };

  const goRoot = () => {
    setCurrentPath("");
    setSelectedFile(null);
  };

  const breadcrumbs = currentPath ? currentPath.split("/") : [];

  return (
    <div className="grid h-full gap-4 p-6 lg:grid-cols-5">
      {/* Left: tree */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden">
        <div className="flex items-center gap-1 border-b border-border p-2">
          <button
            onClick={goRoot}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent"
            title="Root"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={goUp}
            disabled={!currentPath}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent disabled:opacity-40"
            title="Up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <div className="flex flex-1 items-center gap-1 overflow-hidden text-xs text-muted-foreground">
            <span className="font-mono">/</span>
            {breadcrumbs.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="truncate">{part}</span>
                {i < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-3 text-xs text-destructive">{error}</div>
          ) : tree && tree.entries.length > 0 ? (
            <div className="p-1">
              {tree.entries.map((entry) => (
                <button
                  key={entry.name}
                  onClick={() => handleEntryClick(entry.name, entry.is_dir)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs hover:bg-accent"
                >
                  {entry.is_dir ? (
                    <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                  ) : (
                    <FileIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{entry.name}</span>
                  {!entry.is_dir && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {formatSize(entry.size)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="p-3 text-xs text-muted-foreground">Empty directory</p>
          )}
        </ScrollArea>
      </Card>

      {/* Right: file content */}
      <Card className="lg:col-span-3 flex flex-col overflow-hidden">
        {selectedFile ? (
          <>
            <div className="border-b border-border p-2">
              <p className="truncate font-mono text-xs">{selectedFile.path}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatSize(selectedFile.size)} {selectedFile.binary && "· binary"}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <pre className="whitespace-pre-wrap break-words p-3 font-mono text-[11px] leading-relaxed">
                {selectedFile.content}
              </pre>
            </ScrollArea>
          </>
        ) : fileLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a file to preview
          </div>
        )}
      </Card>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}
