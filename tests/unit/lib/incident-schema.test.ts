import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createIncidentSchema,
  photoUploadSchema,
  INCIDENT_CATEGORIES,
  REPORTED_VIA_CHANNELS,
} from "@/lib/validation/incident-schema";

describe("lib/validation/incident-schema.ts", () => {
  const validPayload = {
    category: "LEAK",
    title: "Leak under kitchen sink",
    description: "Water pooling under the sink, cabinet floor is soft.",
    reportedAt: "2026-10-30T10:00:00Z",
    reportedVia: "TEXT",
    photos: [],
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts valid incident payload", () => {
    const result = createIncidentSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("validates categories: pest, heat, leak, appliance, other", () => {
    expect(INCIDENT_CATEGORIES).toEqual(["PEST", "HEAT", "LEAK", "APPLIANCE", "OTHER"]);

    for (const cat of INCIDENT_CATEGORIES) {
      const res = createIncidentSchema.safeParse({ ...validPayload, category: cat });
      expect(res.success).toBe(true);
    }

    const invalid = createIncidentSchema.safeParse({ ...validPayload, category: "MOLD" });
    expect(invalid.success).toBe(false);
  });

  it("requires title and enforces up to 120 characters", () => {
    const emptyTitle = createIncidentSchema.safeParse({ ...validPayload, title: "" });
    expect(emptyTitle.success).toBe(false);

    const longTitle = createIncidentSchema.safeParse({
      ...validPayload,
      title: "a".repeat(121),
    });
    expect(longTitle.success).toBe(false);

    const maxTitle = createIncidentSchema.safeParse({
      ...validPayload,
      title: "a".repeat(120),
    });
    expect(maxTitle.success).toBe(true);
  });

  it("limits description to up to 2000 characters", () => {
    const validDesc = createIncidentSchema.safeParse({
      ...validPayload,
      description: "a".repeat(2000),
    });
    expect(validDesc.success).toBe(true);

    const overDesc = createIncidentSchema.safeParse({
      ...validPayload,
      description: "a".repeat(2001),
    });
    expect(overDesc.success).toBe(false);
  });

  it("requires reportedAt and rejects future dates", () => {
    const futureDate = createIncidentSchema.safeParse({
      ...validPayload,
      reportedAt: "2026-11-05T12:00:00Z",
    });
    expect(futureDate.success).toBe(false);

    const missingDate = createIncidentSchema.safeParse({
      ...validPayload,
      reportedAt: "",
    });
    expect(missingDate.success).toBe(false);
  });

  it("validates reportedVia: text, email, portal, phone, in person", () => {
    expect(REPORTED_VIA_CHANNELS).toEqual(["TEXT", "EMAIL", "PORTAL", "PHONE", "IN_PERSON"]);

    for (const channel of REPORTED_VIA_CHANNELS) {
      const res = createIncidentSchema.safeParse({
        ...validPayload,
        reportedVia: channel,
      });
      expect(res.success).toBe(true);
    }

    const invalid = createIncidentSchema.safeParse({
      ...validPayload,
      reportedVia: "CARRIER_PIGEON",
    });
    expect(invalid.success).toBe(false);
  });

  it("allows up to 5 photos", () => {
    const fivePhotos = createIncidentSchema.safeParse({
      ...validPayload,
      photos: [
        { url: "https://example.com/1.jpg" },
        { url: "https://example.com/2.jpg" },
        { url: "https://example.com/3.jpg" },
        { url: "https://example.com/4.jpg" },
        { url: "https://example.com/5.jpg" },
      ],
    });
    expect(fivePhotos.success).toBe(true);

    const sixPhotos = createIncidentSchema.safeParse({
      ...validPayload,
      photos: [
        { url: "https://example.com/1.jpg" },
        { url: "https://example.com/2.jpg" },
        { url: "https://example.com/3.jpg" },
        { url: "https://example.com/4.jpg" },
        { url: "https://example.com/5.jpg" },
        { url: "https://example.com/6.jpg" },
      ],
    });
    expect(sixPhotos.success).toBe(false);
  });

  it("validates photo uploads: max 10MB each and JPEG, PNG, or HEIC formats", () => {
    const validJpg = photoUploadSchema.safeParse({
      name: "damage.jpg",
      size: 5 * 1024 * 1024,
      type: "image/jpeg",
    });
    expect(validJpg.success).toBe(true);

    const validPng = photoUploadSchema.safeParse({
      name: "damage.png",
      size: 10 * 1024 * 1024,
      type: "image/png",
    });
    expect(validPng.success).toBe(true);

    const validHeic = photoUploadSchema.safeParse({
      name: "damage.heic",
      size: 2 * 1024 * 1024,
      type: "image/heic",
    });
    expect(validHeic.success).toBe(true);

    const oversized = photoUploadSchema.safeParse({
      name: "huge.jpg",
      size: 10 * 1024 * 1024 + 1,
      type: "image/jpeg",
    });
    expect(oversized.success).toBe(false);

    const invalidType = photoUploadSchema.safeParse({
      name: "document.pdf",
      size: 1024,
      type: "application/pdf",
    });
    expect(invalidType.success).toBe(false);
  });
});
