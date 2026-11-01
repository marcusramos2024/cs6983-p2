import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/incidents/route";
import * as auth from "@/lib/auth";
import * as incidentService from "@/lib/services/incident-service";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  requireRole: vi.fn(),
  AuthError: class AuthError extends Error {
    constructor(public statusCode: number, message: string) {
      super(message);
      this.name = "AuthError";
    }
  },
}));

vi.mock("@/lib/services/incident-service", () => ({
  createIncident: vi.fn(),
}));

describe("POST /api/incidents", () => {
  const tenantUser = {
    id: "tenant-1",
    email: "tenant@example.com",
    role: "TENANT" as const,
    buildingId: "bld-1",
    unit: "3A",
  };

  const validBody = {
    category: "PEST",
    title: "Mice in kitchen",
    description: "Saw droppings behind the stove.",
    reportedAt: "2026-10-25T14:30:00Z",
    reportedVia: "PORTAL",
    photos: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when signed out", async () => {
    (auth.requireRole as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new auth.AuthError(401, "Authentication required")
    );

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 when user is not a tenant", async () => {
    (auth.requireRole as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new auth.AuthError(403, "Forbidden: insufficient permissions")
    );

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("returns 400 when input is empty or invalid", async () => {
    (auth.requireRole as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(tenantUser);

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.message).toBeDefined();
  });

  it("returns 201 with created incident data on valid request", async () => {
    (auth.requireRole as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(tenantUser);
    (incidentService.createIncident as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "inc-100",
      ...validBody,
      status: "OPEN",
      tenantId: tenantUser.id,
      buildingId: tenantUser.buildingId,
      events: [{ id: "evt-1", type: "REPORTED" }],
      photos: [],
    });

    const req = new NextRequest("http://localhost:3000/api/incidents", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.id).toBe("inc-100");
    expect(json.data.status).toBe("OPEN");
  });
});

