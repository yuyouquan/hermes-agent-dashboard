"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { ChatMessage, ChatSession } from "./types";

const STORAGE_KEY = "hermes.dashboard.chat-sessions.v1";

interface ChatContextValue {
  readonly sessions: readonly ChatSession[];
  readonly activeSessionId: string | null;
  readonly activeSession: ChatSession | null;
  readonly createSession: (name: string, workdir: string) => string;
  readonly deleteSession: (id: string) => void;
  readonly renameSession: (id: string, name: string) => void;
  readonly setActiveSession: (id: string | null) => void;
  readonly addMessage: (message: ChatMessage) => void;
  readonly updateLastMessage: (content: string) => void;
  readonly removeLastMessage: () => void;
  readonly clearMessages: () => void;
  readonly setHermesSessionId: (hermesId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSessions(sessions: readonly ChatSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function ChatProvider({ children }: { readonly children: ReactNode }) {
  const [sessions, setSessions] = useState<readonly ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    if (loaded.length > 0) {
      const lastActive = localStorage.getItem("hermes.dashboard.chat-active");
      const validId = loaded.find((s) => s.id === lastActive)?.id ?? loaded[0].id;
      setActiveSessionId(validId);
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    saveSessions(sessions);
  }, [sessions, hydrated]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("hermes.dashboard.chat-active", activeSessionId);
    }
  }, [activeSessionId]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const updateSession = useCallback(
    (id: string, updater: (s: ChatSession) => ChatSession) => {
      setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
    },
    []
  );

  const createSession = useCallback(
    (name: string, workdir: string): string => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const session: ChatSession = {
        id,
        name,
        workdir,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(id);
      return id;
    },
    []
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (activeSessionId === id) {
          setActiveSessionId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [activeSessionId]
  );

  const renameSession = useCallback(
    (id: string, name: string) => {
      updateSession(id, (s) => ({ ...s, name }));
    },
    [updateSession]
  );

  const addMessage = useCallback(
    (message: ChatMessage) => {
      if (!activeSessionId) return;
      updateSession(activeSessionId, (s) => ({
        ...s,
        messages: [...s.messages, message],
        updatedAt: new Date().toISOString(),
      }));
    },
    [activeSessionId, updateSession]
  );

  const updateLastMessage = useCallback(
    (content: string) => {
      if (!activeSessionId) return;
      updateSession(activeSessionId, (s) => {
        const msgs = [...s.messages];
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
        return { ...s, messages: msgs };
      });
    },
    [activeSessionId, updateSession]
  );

  const removeLastMessage = useCallback(() => {
    if (!activeSessionId) return;
    updateSession(activeSessionId, (s) => ({
      ...s,
      messages: s.messages.slice(0, -1),
    }));
  }, [activeSessionId, updateSession]);

  const clearMessages = useCallback(() => {
    if (!activeSessionId) return;
    updateSession(activeSessionId, (s) => ({
      ...s,
      messages: [],
      updatedAt: new Date().toISOString(),
    }));
  }, [activeSessionId, updateSession]);

  const setHermesSessionId = useCallback(
    (hermesId: string) => {
      if (!activeSessionId) return;
      updateSession(activeSessionId, (s) => ({
        ...s,
        hermesSessionId: hermesId,
      }));
    },
    [activeSessionId, updateSession]
  );

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        createSession,
        deleteSession,
        renameSession,
        setActiveSession: setActiveSessionId,
        addMessage,
        updateLastMessage,
        removeLastMessage,
        clearMessages,
        setHermesSessionId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return ctx;
}
