import type {
  HermesJob,
  HermesSession,
  HermesMessage,
  HealthStatus,
  MemoryFile,
  HermesSkill,
  LogTailResult,
  GatewayPlatformStatus,
  SessionSearchHit,
  ActiveRun,
  JobRunOutput,
  ConfigContent,
  WorkspaceTree,
  WorkspaceFile,
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

export interface CreateJobInput {
  readonly name: string;
  readonly schedule: string;
  readonly prompt: string;
  readonly deliver?: string;
  readonly skills?: readonly string[];
  readonly repeat?: { readonly times?: number };
}

export async function createJob(
  job: CreateJobInput
): Promise<{ readonly job: HermesJob }> {
  return fetchApi<{ job: HermesJob }>("/api/jobs", {
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

// Memory
export async function getMemory(): Promise<readonly MemoryFile[]> {
  const res = await fetchApi<{ files: MemoryFile[] }>("/api/memory");
  return res.files;
}

export async function updateMemory(
  name: "MEMORY.md" | "USER.md",
  content: string
): Promise<void> {
  await fetchApi<{ name: string; size: number }>(
    `/api/memory/${encodeURIComponent(name)}`,
    {
      method: "PUT",
      body: JSON.stringify({ content }),
    }
  );
}

// Skills
export async function getSkills(): Promise<readonly HermesSkill[]> {
  const res = await fetchApi<{ skills: HermesSkill[]; total: number }>(
    "/api/skills"
  );
  return res.skills;
}

export async function getSkill(id: string): Promise<string> {
  const res = await fetchApi<{ id: string; content: string }>(
    `/api/skills/${id
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`
  );
  return res.content;
}

// Logs
export async function tailLogs(
  file: "gateway" | "gateway_error" | "agent" | "errors" = "gateway",
  lines = 500
): Promise<LogTailResult> {
  return fetchApi<LogTailResult>(`/api/logs/tail?file=${file}&lines=${lines}`);
}

// Gateway status
export async function getGatewayStatus(): Promise<
  readonly GatewayPlatformStatus[]
> {
  const res = await fetchApi<{ platforms: GatewayPlatformStatus[] }>(
    "/api/gateway/status"
  );
  return res.platforms;
}

// Session search
export async function searchSessions(
  query: string,
  limit = 50
): Promise<readonly SessionSearchHit[]> {
  if (!query.trim()) return [];
  const res = await fetchApi<{ results: SessionSearchHit[]; total: number }>(
    `/api/sessions/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return res.results;
}

// Active runs
export async function listActiveRuns(): Promise<{
  readonly runs: readonly ActiveRun[];
  readonly total: number;
  readonly max_concurrent: number;
}> {
  return fetchApi<{
    runs: ActiveRun[];
    total: number;
    max_concurrent: number;
  }>("/v1/runs");
}

export async function createRun(
  prompt: string,
  model?: string
): Promise<{ readonly run_id: string; readonly status: string }> {
  return fetchApi<{ run_id: string; status: string }>("/v1/runs", {
    method: "POST",
    body: JSON.stringify({
      input: prompt,
      ...(model ? { model } : {}),
    }),
  });
}

// Job run history
export async function listJobRuns(
  jobId: string
): Promise<readonly JobRunOutput[]> {
  const res = await fetchApi<{ job_id: string; runs: JobRunOutput[] }>(
    `/api/jobs/${encodeURIComponent(jobId)}/runs`
  );
  return res.runs;
}

export async function getJobRun(
  jobId: string,
  timestamp: string
): Promise<{ readonly content: string; readonly size: number }> {
  return fetchApi<{ content: string; size: number }>(
    `/api/jobs/${encodeURIComponent(jobId)}/runs/${encodeURIComponent(
      timestamp
    )}`
  );
}

// Config
export async function getConfig(): Promise<ConfigContent> {
  return fetchApi<ConfigContent>("/api/config");
}

// Workspace
export async function getWorkspaceTree(path = ""): Promise<WorkspaceTree> {
  const q = path ? `?path=${encodeURIComponent(path)}` : "";
  return fetchApi<WorkspaceTree>(`/api/workspace/tree${q}`);
}

export async function getWorkspaceFile(path: string): Promise<WorkspaceFile> {
  return fetchApi<WorkspaceFile>(
    `/api/workspace/file?path=${encodeURIComponent(path)}`
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
