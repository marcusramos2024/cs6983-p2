import React from "react";

interface StatusBadgeProps {
  status: "Open" | "Acknowledged" | "Resolved" | string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let colorClasses = "border-[#B91C1C] text-[#B91C1C]"; // open
  if (normalized === "acknowledged") {
    colorClasses = "border-[#B45309] text-[#B45309]"; // ack
  } else if (normalized === "resolved") {
    colorClasses = "border-[#15803D] text-[#15803D]"; // resolved
  }

  return (
    <span
      className={`inline-block text-[13px] font-medium px-2 py-0.5 rounded border ${colorClasses} ${className}`}
    >
      {status}
    </span>
  );
}
