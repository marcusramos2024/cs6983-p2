import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getIncidentById } from "@/lib/services/incident-service";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DaysIgnoredBadge } from "@/components/ui/DaysIgnoredBadge";

export default async function IncidentTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = await getIncidentById(id);

  if (!incident) {
    notFound();
  }

  const acknowledgedEvent = incident.events.find(
    (e) => e.type === "ACKNOWLEDGED"
  );

  return (
    <article className="space-y-md">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/incidents" className="hover:underline text-ink">
          My incidents
        </Link>{" "}
        / <span className="text-muted">{incident.title}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-2">
          {incident.title}
        </h1>
        <div className="flex flex-wrap items-center gap-sm text-sm">
          <StatusBadge status={incident.status} />
          <DaysIgnoredBadge
            reportedAt={incident.reportedAt}
            acknowledgedAt={acknowledgedEvent?.createdAt}
          />
          <span className="text-muted">
            {incident.category.toLowerCase()} &middot; reported by{" "}
            {incident.reportedVia.toLowerCase().replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Photos */}
      {incident.photos.length > 0 && (
        <section aria-label="Photos" className="py-xs">
          <h2 className="sr-only">Incident Photos</h2>
          <div className="flex flex-wrap gap-sm">
            {incident.photos.map((photo, i) => (
              <div
                key={photo.id}
                className="w-[72px] h-[72px] rounded-sm border border-line overflow-hidden bg-paper"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`${incident.category.toLowerCase()} photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      <section aria-label="Timeline" className="pt-sm">
        <h2 className="text-lg font-semibold text-ink mb-md">Timeline</h2>
        <ol className="list-none m-0 pl-4 border-l-2 border-line space-y-md">
          {incident.events.map((event) => (
            <li key={event.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-card border-2 border-line"
              />
              <div className="font-mono text-sm text-muted">
                {format(new Date(event.createdAt), "MMM d, yyyy h:mm a")}
              </div>
              <div className="text-sm text-ink mt-0.5">
                {event.type === "REPORTED" && (
                  <>
                    <strong className="font-semibold">Reported</strong> by{" "}
                    {incident.reportedVia.toLowerCase().replace("_", " ")} to the
                    building manager.
                    {event.body && <p className="mt-1 text-muted">&ldquo;{event.body}&rdquo;</p>}
                  </>
                )}
                {event.type === "PHOTO_ADDED" && (
                  <strong className="font-semibold">Photos added</strong>
                )}
                {event.type === "FOLLOW_UP" && (
                  <>
                    <strong className="font-semibold">Follow-up:</strong>{" "}
                    {event.body}
                  </>
                )}
                {event.type === "ACKNOWLEDGED" && (
                  <strong className="font-semibold">Acknowledged</strong>
                )}
                {event.type === "RESPONSE" && (
                  <>
                    <strong className="font-semibold">Response:</strong> &ldquo;{event.body}&rdquo;
                  </>
                )}
                {event.type === "RESOLVED" && (
                  <>
                    <strong className="font-semibold">Resolved:</strong> &ldquo;{event.body}&rdquo;
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="pt-md">
          <button
            type="button"
            className="px-4 py-2 border border-line rounded-md text-sm font-medium bg-card text-ink hover:bg-paper focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Add follow-up
          </button>
        </div>
      </section>
    </article>
  );
}

