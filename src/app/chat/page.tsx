"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatSessionList } from "@/components/chat/chat-session-list";
import { CreateSessionDialog } from "@/components/chat/create-session-dialog";
import { useChatContext } from "@/lib/chat-context";
import { useTranslation } from "@/lib/i18n/context";

export default function ChatPage() {
  const { activeSession } = useChatContext();
  const [createOpen, setCreateOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex h-full">
      {/* Session list sidebar */}
      <ChatSessionList onCreateNew={() => setCreateOpen(true)} />

      {/* Active chat */}
      <div className="flex flex-1 flex-col">
        {activeSession ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">
                  {activeSession.name}
                </h3>
                <p className="truncate text-[10px] font-mono text-muted-foreground">
                  {activeSession.workdir}
                </p>
              </div>
            </div>
            <ChatPanel />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-lg font-medium text-muted-foreground">
              {t("chat.emptyTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("chat.createSessionHint")}
            </p>
          </div>
        )}
      </div>

      <CreateSessionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
