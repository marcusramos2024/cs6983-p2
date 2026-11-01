import React from "react";
import { calculateDaysIgnored, getDaysIgnoredVariant } from "@/lib/days-ignored";

interface DaysIgnoredBadgeProps {
  reportedAt: Date | string;
  acknowledgedAt?: Date | string | null;
  className?: string;
}

export default function DaysIgnoredBadge({
  reportedAt,
  acknowledgedAt,
  className = "",
}: DaysIgnoredBadgeProps) {
  const days = calculateDaysIgnored(reportedAt, acknowledgedAt);
  const variant = getDaysIgnoredVariant(days);

  let variantClasses = "border-muted text-muted";
  if (variant === "ack") {
    variantClasses = "border-ack text-ack";
  } else if (variant === "open") {
    variantClasses = "border-open text-open";
  }

  const label = acknowledgedAt
    ? `Acknowledged after ${days} ${days === 1 ? "day" : "days"}`
    : `${days} ${days === 1 ? "day" : "days"} ignored`;

  return (
    <span
      className={`inline-block text-[13px] font-medium px-2 py-0.5 rounded border ${variantClasses} ${className}`}
    >
      {label}
    </span>
  );
}

