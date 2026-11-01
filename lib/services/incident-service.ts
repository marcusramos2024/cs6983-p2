import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";
import type { CreateIncidentInput } from "@/lib/validation/incident-schema";

/**
 * Creates an incident in the database with an initial REPORTED event and optional photos.
 */
export async function createIncident(
  data: CreateIncidentInput,
  tenant: SessionUser
) {
  if (!tenant.buildingId) {
    throw new Error("Tenant must be associated with a building");
  }

  const reportedDate =
    typeof data.reportedAt === "string"
      ? new Date(data.reportedAt)
      : data.reportedAt;

  const incident = await prisma.incident.create({
    data: {
      category: data.category,
      title: data.title,
      description: data.description || null,
      reportedAt: reportedDate,
      reportedVia: data.reportedVia,
      status: "OPEN",
      tenantId: tenant.id,
      buildingId: tenant.buildingId,
      events: {
        create: {
          type: "REPORTED",
          body: data.description || null,
          actorId: tenant.id,
        },
      },
      photos:
        data.photos && data.photos.length > 0
          ? {
              create: data.photos.map((p) => ({
                url: p.url,
              })),
            }
          : undefined,
    },
    include: {
      events: true,
      photos: true,
    },
  });

  return incident;
}

/**
 * Retrieves an incident by ID including its events and photos in chronological order.
 */
export async function getIncidentById(id: string) {
  return prisma.incident.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: "asc" },
      },
      photos: true,
    },
  });
}

