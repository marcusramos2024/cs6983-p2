import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIncident } from "@/lib/services/incident-service";
import { prisma } from "@/lib/db";

vi.mock("@/lib/db", () => {
  return {
    prisma: {
      incident: {
        create: vi.fn(),
      },
    },
  };
});

describe("lib/services/incident-service.ts", () => {
  const tenantUser = {
    id: "user-123",
    email: "dana@example.com",
    role: "TENANT" as const,
    buildingId: "bld-456",
    unit: "4B",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an incident with status OPEN, initial REPORTED event, and photos", async () => {
    const input = {
      category: "LEAK" as const,
      title: "Leak under kitchen sink",
      description: "Water pooling under the sink, cabinet floor is soft.",
      reportedAt: new Date("2026-10-20T20:02:00Z"),
      reportedVia: "TEXT" as const,
      photos: [{ url: "/uploads/photo-1.jpg" }, { url: "/uploads/photo-2.jpg" }],
    };

    const mockCreatedIncident = {
      id: "inc-789",
      ...input,
      status: "OPEN",
      tenantId: tenantUser.id,
      buildingId: tenantUser.buildingId,
      events: [
        {
          id: "evt-1",
          type: "REPORTED",
          body: input.description,
          actorId: tenantUser.id,
          createdAt: new Date("2026-10-20T20:02:00Z"),
        },
      ],
      photos: [
        { id: "ph-1", url: "/uploads/photo-1.jpg" },
        { id: "ph-2", url: "/uploads/photo-2.jpg" },
      ],
    };

    (prisma.incident.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCreatedIncident
    );

    const result = await createIncident(input, tenantUser);

    expect(prisma.incident.create).toHaveBeenCalledWith({
      data: {
        category: "LEAK",
        title: "Leak under kitchen sink",
        description: "Water pooling under the sink, cabinet floor is soft.",
        reportedAt: input.reportedAt,
        reportedVia: "TEXT",
        status: "OPEN",
        tenantId: "user-123",
        buildingId: "bld-456",
        events: {
          create: {
            type: "REPORTED",
            body: input.description,
            actorId: "user-123",
          },
        },
        photos: {
          create: [
            { url: "/uploads/photo-1.jpg" },
            { url: "/uploads/photo-2.jpg" },
          ],
        },
      },
      include: {
        events: true,
        photos: true,
      },
    });

    expect(result.id).toBe("inc-789");
    expect(result.status).toBe("OPEN");
    expect(result.events[0].type).toBe("REPORTED");
    expect(result.photos).toHaveLength(2);
  });

  it("rejects creation if user is missing a buildingId", async () => {
    const userWithoutBuilding = {
      ...tenantUser,
      buildingId: null,
    };

    const input = {
      category: "HEAT" as const,
      title: "No heat in bedroom",
      description: "Radiator is cold.",
      reportedAt: new Date("2026-10-21T08:00:00Z"),
      reportedVia: "EMAIL" as const,
      photos: [],
    };

    await expect(createIncident(input, userWithoutBuilding)).rejects.toThrow(
      "Tenant must be associated with a building"
    );
  });
});
