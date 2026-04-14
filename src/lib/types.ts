// Hermes Agent data types

export type JobStatus = "pending" | "running" | "completed" | "failed" | "paused";

export type Platform =
  | "local"
  | "telegram"
  | "discord"
  | "slack"
  | "whatsapp"
  | "signal"
  | "matrix"
  | "email"
  | "api";

export interface HermesJob {
  readonly id: string;
  readonly name: string;
  readonly schedule: string;
  readonly skill?: string;
  readonly skills?: readonly string[];
  readonly context?: string;
  readonly background?: boolean;
  readonly deliver?: string;
  readonly origin?: string;
  readonly next_run?: string;
  readonly last_run?: string;
  readonly enabled: boolean;
  readonly paused: boolean;
}

export interface HermesSession {
  readonly id: string;
  readonly source: Platform;
  readonly user_id?: string;
  readonly model: string;
  readonly system_prompt?: string;
  readonly parent_session_id?: string;
  readonly started_at: string;
  readonly ended_at?: string;
  readonly end_reason?: string;
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly cache_read_tokens: number;
  readonly cache_write_tokens: number;
  readonly reasoning_tokens: number;
  readonly estimated_cost_usd: number;
  readonly actual_cost_usd?: number;
  readonly title?: string;
  readonly message_count: number;
  readonly tool_call_count: number;
}

export interface HermesMessage {
  readonly id: string;
  readonly session_id: string;
  readonly role: "user" | "assistant" | "tool" | "system";
  readonly content: string;
  readonly tool_calls?: string;
  readonly tool_name?: string;
  readonly tool_call_id?: string;
  readonly timestamp: string;
  readonly token_count: number;
  readonly finish_reason?: string;
  readonly reasoning?: string;
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
  readonly totalSessions: number;
  readonly totalTokens: number;
  readonly totalCost: number;
}
