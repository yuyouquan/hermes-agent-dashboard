"use client";

import { useChatContext } from "@/lib/chat-context";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  MessageSquare,
  Folder,
} from "lucide-react";

interface ChatSessionListProps {
  readonly onCreateNew: () => void;
}

export function ChatSessionList({ onCreateNew }: ChatSessionListProps) {
  const {
    sessions,
    activeSessionId,
    setActiveSession,
    deleteSession,
  } = useChatContext();
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-56 min-w-56 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase">
          {t("chat.sessions")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCreateNew}
          title={t("chat.newSession")}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-1.5">
          {sessions.length === 0 ? (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              {t("chat.noSessions")}
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={cn(
                  "group flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 transition-colors",
                  session.id === activeSessionId
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {session.name}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Folder className="h-2.5 w-2.5" />
                    <span className="truncate">
                      {session.workdir.split("/").pop() || session.workdir}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {session.messages.length} {t("chat.messagesCount")}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(t("chat.confirmDelete"))) {
                      deleteSession(session.id);
                    }
                  }}
                  className="mt-0.5 hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:block"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
