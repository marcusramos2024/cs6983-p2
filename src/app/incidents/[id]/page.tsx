import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import DaysIgnoredBadge from "@/components/DaysIgnoredBadge";
import IncidentTimeline from "@/components/IncidentTimeline";

interface IncidentDetailPageProps {
  params: {
    id: string;
  };
}

export default async function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const incident = await prisma.incident.findUnique({
    where: { id: params.id },
    include: {
      photos: true,
      events: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!incident) {
    notFound();
  }

  // Tenant role check: only owner can view
  if (user && user.role === "tenant" && incident.tenantId !== user.id) {
    notFound();
  }

  return (
    <div className="space-y-lg">
      {/* Breadcrumb navigation */}
      <div>
        <p className="text-sm text-muted mb-xs">
          <Link href="/incidents" className="hover:text-primary transition-colors">
            My incidents
          </Link>{" "}
          / <span className="text-ink">{incident.title}</span>
        </p>
        <h1 className="text-2xl font-semibold text-ink">{incident.title}</h1>
      </div>

      {/* Incident Status and Details */}
      <div className="flex flex-wrap items-center gap-sm">
        <StatusBadge status={incident.status} />
        <DaysIgnoredBadge reportedAt={incident.reportedAt} />
        <span className="text-sm text-muted capitalize">
          {incident.category} &middot; reported by {incident.reportedVia}
        </span>
      </div>

      {/* Description if present */}
      {incident.description && (
        <div className="bg-card p-md rounded-md border border-line">
          <h2 className="text-sm font-semibold text-ink mb-xs">Description</h2>
          <p className="text-sm text-ink whitespace-pre-wrap">{incident.description}</p>
        </div>
      )}

      {/* Photos attached */}
      {incident.photos && incident.photos.length > 0 && (
        <div className="space-y-xs">
          <h2 className="text-sm font-semibold text-ink">
            Attached Photos ({incident.photos.length})
          </h2>
          <div className="flex flex-wrap gap-sm">
            {incident.photos.map((photo, i) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noreferrer"
                className="w-20 h-20 rounded-md border border-line overflow-hidden bg-card hover:border-primary transition-colors block"
                title={photo.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Photo ${i + 1}: ${photo.filename}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-md pt-sm">
        <h2 className="text-lg font-semibold text-ink">Timeline</h2>
        <IncidentTimeline events={incident.events} />
      </div>

      {/* Actions */}
      <div className="pt-sm">
        <button
          type="button"
          className="px-md py-xs border border-line rounded-sm bg-card hover:border-primary text-sm font-medium transition-colors"
        >
          Add follow-up
        </button>
      </div>
    </div>
  );
}
