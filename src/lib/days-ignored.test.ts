import { describe, it, expect } from "vitest";
import { calculateDaysIgnored } from "./days-ignored";

describe("calculateDaysIgnored", () => {
  it("returns 0 when reported recently within the same day", () => {
    const reportedAt = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 hours ago
    expect(calculateDaysIgnored(reportedAt)).toBe(0);
  });

  it("calculates whole days from reported date until now if unacknowledged", () => {
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    expect(calculateDaysIgnored(fourDaysAgo)).toBe(4);
  });

  it("stops counting once acknowledged and returns days until acknowledged", () => {
    const reportedAt = new Date("2026-10-01T10:00:00Z");
    const acknowledgedAt = new Date("2026-10-05T10:00:00Z"); // 4 days later
    expect(calculateDaysIgnored(reportedAt, acknowledgedAt)).toBe(4);
  });
});

