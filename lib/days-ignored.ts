import { differenceInDays } from "date-fns";

/**
 * Calculates whole days elapsed since an incident was reported until acknowledged or now.
 */
export function calculateDaysIgnored(
  reportedAt: Date | string,
  acknowledgedAt?: Date | string | null,
  now: Date = new Date()
): number {
  const start = typeof reportedAt === "string" ? new Date(reportedAt) : reportedAt;
  const end = acknowledgedAt
    ? typeof acknowledgedAt === "string"
      ? new Date(acknowledgedAt)
      : acknowledgedAt
    : now;

  const days = differenceInDays(end, start);
  return Math.max(0, days);
}

/**
 * Returns the color variant token for a days-ignored count per DESIGN.md.
 */
export function getDaysIgnoredVariant(days: number): "muted" | "ack" | "open" {
  if (days < 3) return "muted";
  if (days <= 7) return "ack";
  return "open";
}

/**
 * Formats the days-ignored display label.
 */
export function formatDaysIgnored(days: number, isAcknowledged = false): string {
  const plural = days === 1 ? "day" : "days";
  if (isAcknowledged) {
    return `Acknowledged after ${days} ${plural}`;
  }
  return `${days} ${plural} ignored`;
}

