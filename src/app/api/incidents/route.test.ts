import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

// Mock authOptions
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    incident: {
      create: vi.fn(),
    },
    incidentEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prismaMock)),
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";
import { NextRequest } from "next/server";

const prismaMock = prisma as any;

describe("POST /api/incidents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify({ title: "Test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 when user is not a tenant", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: {
        id: "mgr1",
        role: "manager",
        buildingId: "bldg1",
      },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        category: "leak",
        reportedAt: new Date().toISOString(),
        reportedVia: "text",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("Forbidden: only tenants can create incidents");
  });

  it("returns 400 when validation fails", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: {
        id: "tenant1",
        role: "tenant",
        buildingId: "bldg1",
      },
    } as any);

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify({
        title: "", // missing
        category: "invalid-cat",
        reportedAt: new Date(Date.now() + 100000).toISOString(), // future
        reportedVia: "magic",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.errors).toBeDefined();
    expect(data.errors.title).toBeDefined();
    expect(data.errors.category).toBeDefined();
    expect(data.errors.reportedAt).toBeDefined();
  });

  it("creates incident and timeline events when valid", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: {
        id: "tenant1",
        role: "tenant",
        buildingId: "bldg1",
        name: "Dana Tenant",
      },
    } as any);

    const mockCreatedIncident = {
      id: "inc-123",
      title: "Broken radiator valve",
      category: "heat",
      description: "Valve is hissing and leaking steam.",
      reportedAt: new Date("2026-10-30T10:00:00Z"),
      reportedVia: "email",
      status: "Open",
      tenantId: "tenant1",
      buildingId: "bldg1",
      photos: [
        {
          id: "photo-1",
          url: "data:image/jpeg;base64,123",
          filename: "valve.jpg",
          size: 2000,
          mimeType: "image/jpeg",
        },
      ],
      events: [
        {
          id: "evt-1",
          type: "REPORTED",
          title: "Reported by email",
          content: "Valve is hissing and leaking steam.",
          createdAt: new Date(),
        },
        {
          id: "evt-2",
          type: "PHOTOS_ADDED",
          title: "Photos added (1)",
          createdAt: new Date(),
        },
      ],
    };

    prismaMock.$transaction.mockResolvedValueOnce(mockCreatedIncident);

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify({
        title: "Broken radiator valve",
        category: "heat",
        description: "Valve is hissing and leaking steam.",
        reportedAt: new Date("2026-10-30T10:00:00Z").toISOString(),
        reportedVia: "email",
        photos: [
          {
            url: "data:image/jpeg;base64,123",
            filename: "valve.jpg",
            size: 2000,
            mimeType: "image/jpeg",
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.incident.id).toBe("inc-123");
    expect(data.incident.title).toBe("Broken radiator valve");
    expect(data.incident.status).toBe("Open");
  });
});
