"use client";

import { useState, useCallback, useEffect } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "./chat-bubble";
import { useAutoScroll } from "@/lib/hooks";
import { useChatContext } from "@/lib/chat-context";
import { sendChatMessage } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/context";

export function ChatPanel() {
  const {
    activeSession,
    addMessage,
    updateLastMessage,
    removeLastMessage,
    clearMessages,
  } = useChatContext();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { ref, scrollToBottom } = useAutoScroll<HTMLDivElement>();
  const { t } = useTranslation();

  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !activeSession) return;

    addMessage({
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    });
    setInput("");
    setLoading(true);

    try {
      const stream = await sendChatMessage(text, {
        sessionId: activeSession.hermesSessionId,
        workdir: activeSession.workdir,
        history: activeSession.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (!stream) {
        throw new Error("No response stream");
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      addMessage({
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              updateLastMessage(assistantContent);
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }

      if (!assistantContent) {
        updateLastMessage("Response received (no streaming content)");
      }
    } catch (err) {
      if (messages.length > 0 && messages[messages.length - 1]?.content === "") {
        removeLastMessage();
      }
      addMessage({
        role: "assistant",
        content: `${t("chat.errorPrefix")}: ${
          err instanceof Error ? err.message : "Failed to get response"
        }. ${t("chat.errorSuffix")}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeSession, messages, addMessage, updateLastMessage, removeLastMessage, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (!activeSession) return null;

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4" ref={ref}>
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-muted-foreground">
                {t("chat.emptyTitle")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("chat.emptySubtitle")}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatBubble key={`${msg.timestamp}-${i}`} message={msg} />
          ))}
          {loading && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("chat.thinking")}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            placeholder={t("chat.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-10 max-h-32 resize-none"
            disabled={loading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              disabled={loading}
              title={t("chat.clearChat")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
