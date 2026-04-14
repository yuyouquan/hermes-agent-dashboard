import type {
  HermesJob,
  HermesSession,
  HermesMessage,
  HealthStatus,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_HERMES_API_URL ?? "http://localhost:8642";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  const apiKey = process.env.NEXT_PUBLIC_HERMES_API_KEY;
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Hermes API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// Health
export async function getHealth(): Promise<HealthStatus> {
  try {
    await fetchApi<{ status: string }>("/health");
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch {
    return { status: "unhealthy", timestamp: new Date().toISOString() };
  }
}

// Jobs
export async function getJobs(): Promise<readonly HermesJob[]> {
  const res = await fetchApi<{ jobs: HermesJob[] }>("/api/jobs");
  return res.jobs;
}

export async function getJob(id: string): Promise<HermesJob> {
  return fetchApi<HermesJob>(`/api/jobs/${encodeURIComponent(id)}`);
}

export async function createJob(
  job: Omit<HermesJob, "id" | "enabled" | "paused">
): Promise<HermesJob> {
  return fetchApi<HermesJob>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export async function updateJob(
  id: string,
  updates: Partial<HermesJob>
): Promise<HermesJob> {
  return fetchApi<HermesJob>(`/api/jobs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteJob(id: string): Promise<void> {
  await fetchApi<void>(`/api/jobs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function pauseJob(id: string): Promise<void> {
  await fetchApi<void>(`/api/jobs/${encodeURIComponent(id)}/pause`, {
    method: "POST",
  });
}

export async function resumeJob(id: string): Promise<void> {
  await fetchApi<void>(`/api/jobs/${encodeURIComponent(id)}/resume`, {
    method: "POST",
  });
}

export async function runJob(id: string): Promise<void> {
  await fetchApi<void>(`/api/jobs/${encodeURIComponent(id)}/run`, {
    method: "POST",
  });
}

// Sessions
export interface ListSessionsResult {
  readonly sessions: readonly HermesSession[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export async function getSessions(params?: {
  readonly source?: string;
  readonly limit?: number;
  readonly offset?: number;
}): Promise<ListSessionsResult> {
  const q = new URLSearchParams();
  if (params?.source) q.set("source", params.source);
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  if (params?.offset !== undefined) q.set("offset", String(params.offset));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return fetchApi<ListSessionsResult>(`/api/sessions${suffix}`);
}

export interface SessionDetail {
  readonly session: HermesSession;
  readonly messages: readonly HermesMessage[];
}

export async function getSessionMessages(
  sessionId: string
): Promise<SessionDetail> {
  return fetchApi<SessionDetail>(
    `/api/sessions/${encodeURIComponent(sessionId)}/messages`
  );
}

// Chat
export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<ReadableStream<Uint8Array> | null> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.NEXT_PUBLIC_HERMES_API_KEY;
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  if (sessionId) {
    headers["X-Hermes-Session-Id"] = sessionId;
  }

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "hermes",
      messages: [{ role: "user", content: message }],
      stream: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat error ${res.status}`);
  }

  return res.body;
}
