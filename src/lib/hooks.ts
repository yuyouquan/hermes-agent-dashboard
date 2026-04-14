import { useState, useEffect, useCallback, useRef } from "react";
import type { HermesJob, HealthStatus } from "./types";
import { getJobs, getHealth } from "./api";

export function useHermesJobs(pollInterval = 10_000) {
  const [jobs, setJobs] = useState<readonly HermesJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await getJobs();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, pollInterval);
    return () => clearInterval(interval);
  }, [fetchJobs, pollInterval]);

  return { jobs, loading, error, refetch: fetchJobs } as const;
}

export function useHealthCheck(pollInterval = 15_000) {
  const [health, setHealth] = useState<HealthStatus>({
    status: "unknown",
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const check = async () => {
      const result = await getHealth();
      setHealth(result);
    };

    check();
    const interval = setInterval(check, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return health;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useAutoScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const shouldAutoScroll = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (ref.current && shouldAutoScroll.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref, scrollToBottom } as const;
}
