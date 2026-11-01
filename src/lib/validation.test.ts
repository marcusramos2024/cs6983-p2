import { describe, it, expect } from "vitest";
import { validateIncidentInput, validatePhotoFile } from "./validation";

describe("validateIncidentInput", () => {
  const validPayload = {
    title: "Leaking pipe under kitchen sink",
    category: "leak",
    description: "Water is dripping into the cabinet and pooling on the floor.",
    reportedAt: new Date(Date.now() - 3600000).toISOString(),
    reportedVia: "text",
    photos: [
      {
        url: "data:image/jpeg;base64,abc123",
        filename: "leak.jpg",
        size: 1024 * 500, // 500 KB
        mimeType: "image/jpeg",
      },
    ],
  };

  it("passes with valid payload", () => {
    const result = validateIncidentInput(validPayload);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("requires a title", () => {
    const result = validateIncidentInput({ ...validPayload, title: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it("rejects title longer than 120 characters", () => {
    const longTitle = "a".repeat(121);
    const result = validateIncidentInput({ ...validPayload, title: longTitle });
    expect(result.valid).toBe(false);
    expect(result.errors.title).toContain("120");
  });

  it("rejects description longer than 2000 characters", () => {
    const longDesc = "a".repeat(2001);
    const result = validateIncidentInput({ ...validPayload, description: longDesc });
    expect(result.valid).toBe(false);
    expect(result.errors.description).toContain("2000");
  });

  it("rejects invalid category", () => {
    const result = validateIncidentInput({ ...validPayload, category: "aliens" });
    expect(result.valid).toBe(false);
    expect(result.errors.category).toBeDefined();
  });

  it("accepts valid categories: pest, heat, leak, appliance, other", () => {
    const categories = ["pest", "heat", "leak", "appliance", "other"];
    for (const cat of categories) {
      const result = validateIncidentInput({ ...validPayload, category: cat });
      expect(result.valid).toBe(true);
    }
  });

  it("requires reportedAt date and time", () => {
    const result = validateIncidentInput({ ...validPayload, reportedAt: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.reportedAt).toBeDefined();
  });

  it("rejects reportedAt in the future", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = validateIncidentInput({ ...validPayload, reportedAt: futureDate });
    expect(result.valid).toBe(false);
    expect(result.errors.reportedAt).toContain("future");
  });

  it("rejects invalid reportedVia", () => {
    const result = validateIncidentInput({ ...validPayload, reportedVia: "telepathy" });
    expect(result.valid).toBe(false);
    expect(result.errors.reportedVia).toBeDefined();
  });

  it("accepts valid reportedVia: text, email, portal, phone, in person", () => {
    const methods = ["text", "email", "portal", "phone", "in person"];
    for (const method of methods) {
      const result = validateIncidentInput({ ...validPayload, reportedVia: method });
      expect(result.valid).toBe(true);
    }
  });

  it("rejects more than 5 photos", () => {
    const photos = Array.from({ length: 6 }).map((_, i) => ({
      url: `data:image/jpeg;base64,pic${i}`,
      filename: `photo${i}.jpg`,
      size: 1000,
      mimeType: "image/jpeg",
    }));
    const result = validateIncidentInput({ ...validPayload, photos });
    expect(result.valid).toBe(false);
    expect(result.errors.photos).toContain("5");
  });
});

describe("validatePhotoFile", () => {
  it("accepts JPEG, PNG, and HEIC under 10 MB", () => {
    expect(validatePhotoFile("photo.jpg", "image/jpeg", 5 * 1024 * 1024).valid).toBe(true);
    expect(validatePhotoFile("photo.png", "image/png", 9 * 1024 * 1024).valid).toBe(true);
    expect(validatePhotoFile("photo.heic", "image/heic", 8 * 1024 * 1024).valid).toBe(true);
    expect(validatePhotoFile("photo.heif", "image/heif", 8 * 1024 * 1024).valid).toBe(true);
  });

  it("rejects file larger than 10 MB", () => {
    const result = validatePhotoFile("large.jpg", "image/jpeg", 11 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10 MB");
  });

  it("rejects unsupported MIME types", () => {
    expect(validatePhotoFile("file.pdf", "application/pdf", 1024).valid).toBe(false);
    expect(validatePhotoFile("file.gif", "image/gif", 1024).valid).toBe(false);
    expect(validatePhotoFile("file.svg", "image/svg+xml", 1024).valid).toBe(false);
  });
});

