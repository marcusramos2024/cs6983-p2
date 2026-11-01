/**
 * Calculates whole days ignored from reportedAt date until acknowledgedAt (or until now).
 * Days ignored = whole days from reported-at until acknowledged, or until now if not acknowledged yet.
 */
export function calculateDaysIgnored(
  reportedAt: Date | string,
  acknowledgedAt?: Date | string | null,
  now: Date = new Date()
): number {
  const start = new Date(reportedAt).getTime();
  const end = acknowledgedAt ? new Date(acknowledgedAt).getTime() : now.getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return 0;
  }

  const diffMs = end - start;
  const wholeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, wholeDays);
}

/**
 * Returns the badge variant color class for days ignored:
 * muted (< 3 days), ack (3 to 7 days), open (> 7 days).
 */
export function getDaysIgnoredVariant(days: number): "muted" | "ack" | "open" {
  if (days < 3) return "muted";
  if (days <= 7) return "ack";
  return "open";
}
