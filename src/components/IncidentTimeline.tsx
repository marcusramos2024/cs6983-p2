import React from "react";

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  content?: string | null;
  createdAt: Date | string;
}

interface IncidentTimelineProps {
  events: TimelineEvent[];
}

function formatTimelineDate(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export default function IncidentTimeline({ events }: IncidentTimelineProps) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-muted">No timeline events recorded yet.</p>;
  }

  return (
    <ol className="relative pl-md border-l-2 border-line space-y-md list-none">
      {events.map((event) => (
        <li key={event.id} className="relative pl-xs">
          {/* Timeline bullet */}
          <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-card border-2 border-line" />

          {/* Timestamp in monospace font */}
          <div className="font-mono text-sm text-muted mb-0.5">
            {formatTimelineDate(event.createdAt)}
          </div>

          {/* Event description */}
          <div className="text-ink text-sm">
            <span className="font-semibold">{event.title}</span>
            {event.content && (
              <p className="mt-0.5 text-ink/90 whitespace-pre-wrap">
                {event.content}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
