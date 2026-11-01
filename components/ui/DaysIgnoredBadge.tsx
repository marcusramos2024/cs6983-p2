import React from "react";
import {
  calculateDaysIgnored,
  getDaysIgnoredVariant,
  formatDaysIgnored,
} from "@/lib/days-ignored";

interface DaysIgnoredBadgeProps {
  reportedAt: Date | string;
  acknowledgedAt?: Date | string | null;
  className?: string;
}

const VARIANT_CONFIG: Record<"muted" | "ack" | "open", string> = {
  muted: "text-muted border-line bg-paper",
  ack: "text-ack border-ack bg-ack/10",
  open: "text-open border-open bg-open/10",
};

export function DaysIgnoredBadge({
  reportedAt,
  acknowledgedAt,
  className = "",
}: DaysIgnoredBadgeProps) {
  const days = calculateDaysIgnored(reportedAt, acknowledgedAt);
  const variant = getDaysIgnoredVariant(days);
  const label = formatDaysIgnored(days, !!acknowledgedAt);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold border ${VARIANT_CONFIG[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
