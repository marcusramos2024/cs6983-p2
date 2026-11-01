import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import DaysIgnoredBadge from "@/components/DaysIgnoredBadge";

export default async function IncidentsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // If user is logged in as tenant, filter by tenantId, otherwise show all/recent
  const whereClause = user?.id ? { tenantId: user.id } : {};

  const incidents = await prisma.incident.findMany({
    where: whereClause,
    include: {
      photos: true,
      events: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">My incidents</h1>
          <p className="text-sm text-muted">
            Track reported issues, manager responses, and days ignored.
          </p>
        </div>
        <Link
          href="/incidents/new"
          className="px-md py-sm bg-primary text-white rounded-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Log an incident
        </Link>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-card p-xl rounded-md border border-line text-center space-y-md my-md">
          <p className="text-muted text-base">No incidents yet. Log your first one.</p>
          <div>
            <Link
              href="/incidents/new"
              className="px-md py-sm bg-primary text-white rounded-sm font-medium hover:bg-primary/90 inline-block transition-colors"
            >
              Log an incident
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-sm">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-card p-md rounded-md border border-line hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
                <div>
                  <div className="flex items-center gap-xs text-xs text-muted mb-1 capitalize">
                    <span>{incident.category}</span>
                    <span>&middot;</span>
                    <span>Reported by {incident.reportedVia}</span>
                    {incident.photos.length > 0 && (
                      <>
                        <span>&middot;</span>
                        <span>{incident.photos.length} {incident.photos.length === 1 ? "photo" : "photos"}</span>
                      </>
                    )}
                  </div>
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="text-base font-semibold text-ink hover:text-primary transition-colors block"
                  >
                    {incident.title}
                  </Link>
                </div>

                <div className="flex items-center gap-sm">
                  <StatusBadge status={incident.status} />
                  <DaysIgnoredBadge reportedAt={incident.reportedAt} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

