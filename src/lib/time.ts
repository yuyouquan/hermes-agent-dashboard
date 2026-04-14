/** Relative time formatting — "in 5m", "2h ago" */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const UNITS: readonly [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.35, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];

  let value = absSec;
  let unit = "s";
  for (let i = 0; i < UNITS.length; i++) {
    const [divisor, nextUnit] = UNITS[i];
    if (value < divisor) {
      unit = i === 0 ? "s" : UNITS[i - 1][1];
      break;
    }
    value = value / divisor;
    unit = nextUnit;
  }

  const rounded = Math.round(value);
  return diffSec >= 0 ? `in ${rounded}${unit}` : `${rounded}${unit} ago`;
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

/** Convert Unix timestamp (float seconds) to Date */
export function unixToDate(unixSec: number | null | undefined): Date | null {
  if (unixSec === null || unixSec === undefined) return null;
  return new Date(unixSec * 1000);
}

export function formatUnixTime(unixSec: number | null | undefined): string {
  const date = unixToDate(unixSec);
  if (!date) return "—";
  return date.toLocaleString();
}

export function formatUnixRelative(unixSec: number | null | undefined): string {
  const date = unixToDate(unixSec);
  if (!date) return "—";
  return formatRelativeTime(date.toISOString());
}
