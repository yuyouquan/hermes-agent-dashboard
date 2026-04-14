// Hermes Agent data types — mirrors /api/jobs response shape

export type JobState = "scheduled" | "paused" | "completed";
export type JobStatus = "pending" | "running" | "completed" | "failed" | "paused";
export type LastRunStatus = "ok" | "error" | null;

export type ScheduleKind = "once" | "interval" | "cron";

export interface JobSchedule {
  readonly kind: ScheduleKind;
  readonly display: string;
  readonly expr?: string;
  readonly minutes?: number;
  readonly run_at?: string;
}

export interface JobRepeat {
  readonly times: number | null;
  readonly completed: number;
}

export interface JobOrigin {
  readonly platform: string;
  readonly chat_id?: string;
  readonly chat_name?: string;
  readonly thread_id?: string | null;
}

export interface HermesJob {
  readonly id: string;
  readonly name: string;
  readonly prompt: string;
  readonly skills: readonly string[];
  readonly skill: string | null;
  readonly model: string | null;
  readonly provider: string | null;
  readonly base_url: string | null;
  readonly script: string | null;
  readonly schedule: JobSchedule;
  readonly schedule_display: string;
  readonly repeat: JobRepeat;
  readonly enabled: boolean;
  readonly state: JobState;
  readonly paused_at: string | null;
  readonly paused_reason: string | null;
  readonly created_at: string;
  readonly next_run_at: string | null;
  readonly last_run_at: string | null;
  readonly last_status: LastRunStatus;
  readonly last_error: string | null;
  readonly last_delivery_error?: string | null;
  readonly deliver: string;
  readonly origin: JobOrigin | null;
}

export type Platform =
  | "local"
  | "telegram"
  | "discord"
  | "slack"
  | "whatsapp"
  | "signal"
  | "matrix"
  | "email"
  | "feishu"
  | "api";

/** Hermes session row — started_at / ended_at are Unix timestamps (float seconds) */
export interface HermesSession {
  readonly id: string;
  readonly source: string;
  readonly user_id: string | null;
  readonly model: string | null;
  readonly model_config?: string | null;
  readonly system_prompt?: string | null;
  readonly parent_session_id: string | null;
  readonly started_at: number;
  readonly ended_at: number | null;
  readonly end_reason: string | null;
  readonly message_count: number;
  readonly tool_call_count: number;
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly cache_read_tokens: number;
  readonly cache_write_tokens: number;
  readonly reasoning_tokens: number;
  readonly billing_provider: string | null;
  readonly estimated_cost_usd: number | null;
  readonly actual_cost_usd: number | null;
  readonly title: string | null;
}

/** Hermes message row — timestamp is a Unix timestamp (float seconds) */
export interface HermesMessage {
  readonly id: number;
  readonly session_id: string;
  readonly role: "user" | "assistant" | "tool" | "system";
  readonly content: string | null;
  readonly tool_call_id: string | null;
  readonly tool_calls: unknown[] | string | null;
  readonly tool_name: string | null;
  readonly timestamp: number;
  readonly token_count: number | null;
  readonly finish_reason: string | null;
  readonly reasoning: string | null;
}

export interface ChatMessage {
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: string;
}

export interface HealthStatus {
  readonly status: "healthy" | "unhealthy" | "unknown";
  readonly timestamp: string;
}

export type KanbanColumn = {
  readonly id: JobStatus;
  readonly title: string;
  readonly jobs: readonly HermesJob[];
};

export interface DashboardStats {
  readonly totalJobs: number;
  readonly activeJobs: number;
  readonly pausedJobs: number;
  readonly completedJobs: number;
  readonly failedJobs: number;
  readonly upcomingToday: number;
}

export interface MemoryFile {
  readonly name: string;
  readonly path?: string;
  readonly content?: string;
  readonly size?: number;
  readonly modified_at?: number;
  readonly error?: string;
}

export interface HermesSkill {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly path: string;
  readonly category: string;
}

export interface LogTailResult {
  readonly file: string;
  readonly path: string;
  readonly lines: readonly string[];
  readonly size?: number;
}

export interface GatewayPlatformStatus {
  readonly platform: string;
  readonly connected: boolean;
  readonly class: string;
}

export interface SessionSearchHit {
  readonly id: number;
  readonly session_id: string;
  readonly role: string;
  readonly snippet: string;
  readonly timestamp: number;
  readonly tool_name: string | null;
  readonly source: string;
  readonly model?: string | null;
}

/** Derive kanban bucket from real job fields */
export function getJobStatus(job: HermesJob): JobStatus {
  if (job.state === "paused") return "paused";
  if (job.state === "completed") return "completed";
  if (job.last_status === "error") return "failed";
  if (!job.enabled) return "paused";
  return job.last_run_at ? "running" : "pending";
}
