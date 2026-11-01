import React from "react";

export type StatusValue = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

const STATUS_CONFIG: Record<StatusValue, { label: string; className: string }> = {
  OPEN: {
    label: "Open",
    className: "text-open border-open bg-open/10",
  },
  ACKNOWLEDGED: {
    label: "Acknowledged",
    className: "text-ack border-ack bg-ack/10",
  },
  RESOLVED: {
    label: "Resolved",
    className: "text-resolved border-resolved bg-resolved/10",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

