"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Markdown } from "@/components/ui/markdown";
import { Loader2, Bot, User, Wrench, Brain } from "lucide-react";
import { getSessionMessages } from "@/lib/api";
import type { HermesMessage, HermesSession } from "@/lib/types";
import { formatUnixTime } from "@/lib/time";

interface SessionDetailDialogProps {
  readonly sessionId: string | null;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function SessionDetailDialog({
  sessionId,
  open,
  onClose,
}: SessionDetailDialogProps) {
  const [session, setSession] = useState<HermesSession | null>(null);
  const [messages, setMessages] = useState<readonly HermesMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSession(null);
    setMessages([]);

    getSessionMessages(sessionId)
      .then((data) => {
        if (cancelled) return;
        setSession(data.session);
        setMessages(data.messages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load session");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, open]);

  const visibleMessages = messages.filter((m) => m.role !== "system");

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-hidden sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-left">
            {session?.title ?? "Session"}
          </SheetTitle>
          <SheetDescription className="text-left font-mono text-xs">
            {sessionId}
          </SheetDescription>
        </SheetHeader>

        {session && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary" className="capitalize">
              {session.source}
            </Badge>
            {session.model && (
              <Badge variant="outline">{session.model}</Badge>
            )}
            <span className="text-muted-foreground">
              {session.message_count} messages
            </span>
            <span className="text-muted-foreground">
              · {(session.input_tokens + session.output_tokens).toLocaleString()} tokens
            </span>
            <span className="text-muted-foreground">
              · {formatUnixTime(session.started_at)}
            </span>
          </div>
        )}

        <Separator className="my-4" />

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-14rem)] pr-4">
            <div className="space-y-4">
              {visibleMessages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No messages in this session yet.
                </p>
              ) : (
                visibleMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ message }: { readonly message: HermesMessage }) {
  const { role, content, tool_name, reasoning, timestamp } = message;

  // Tool calls / tool results
  if (role === "tool") {
    return (
      <div className="flex gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1 rounded-md border border-border bg-muted/40 p-2.5">
          <div className="mb-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="font-mono uppercase">tool</span>
            {tool_name && <span>{tool_name}</span>}
            <span className="ml-auto">{formatUnixTime(timestamp)}</span>
          </div>
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] text-muted-foreground line-clamp-[12]">
            {content ?? "(empty)"}
          </pre>
        </div>
      </div>
    );
  }

  const isUser = role === "user";
  const Icon = isUser ? User : Bot;

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary" : "bg-secondary"
        }`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${
            isUser ? "text-primary-foreground" : "text-secondary-foreground"
          }`}
        />
      </div>
      <div className="min-w-0 max-w-[85%] space-y-1.5">
        {reasoning && (
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-2 text-[11px] text-muted-foreground">
            <div className="mb-1 flex items-center gap-1 font-semibold">
              <Brain className="h-3 w-3" />
              Reasoning
            </div>
            <div className="whitespace-pre-wrap">{reasoning}</div>
          </div>
        )}
        <div
          className={`rounded-lg px-3 py-2 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {content ? (
            isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {content}
              </p>
            ) : (
              <Markdown content={content} />
            )
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {message.tool_calls ? "(tool call)" : "(empty)"}
            </p>
          )}
          <p
            className={`mt-1 text-[10px] ${
              isUser ? "text-primary-foreground/60" : "text-muted-foreground"
            }`}
          >
            {formatUnixTime(timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}
