import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateDaysIgnored,
  getDaysIgnoredVariant,
  formatDaysIgnored,
} from "@/lib/days-ignored";

describe("lib/days-ignored.ts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates 0 whole days ignored when reported-at is now", () => {
    const reportedAt = new Date("2026-10-31T12:00:00Z");
    const days = calculateDaysIgnored(reportedAt);
    expect(days).toBe(0);
  });

  it("calculates whole days ignored correctly as whole days elapsed", () => {
    const reportedAt = new Date("2026-10-27T10:00:00Z");
    const days = calculateDaysIgnored(reportedAt);
    expect(days).toBe(4);
  });

  it("stops counting days ignored once acknowledged", () => {
    const reportedAt = new Date("2026-10-20T12:00:00Z");
    const acknowledgedAt = new Date("2026-10-26T12:00:00Z");
    const days = calculateDaysIgnored(reportedAt, acknowledgedAt);
    expect(days).toBe(6);
  });

  it("returns muted variant under 3 days", () => {
    expect(getDaysIgnoredVariant(0)).toBe("muted");
    expect(getDaysIgnoredVariant(1)).toBe("muted");
    expect(getDaysIgnoredVariant(2)).toBe("muted");
  });

  it("returns ack variant for 3 to 7 days inclusive", () => {
    expect(getDaysIgnoredVariant(3)).toBe("ack");
    expect(getDaysIgnoredVariant(5)).toBe("ack");
    expect(getDaysIgnoredVariant(7)).toBe("ack");
  });

  it("returns open variant for over 7 days", () => {
    expect(getDaysIgnoredVariant(8)).toBe("open");
    expect(getDaysIgnoredVariant(14)).toBe("open");
  });

  it("formats the days ignored badge text correctly", () => {
    expect(formatDaysIgnored(0)).toBe("0 days ignored");
    expect(formatDaysIgnored(1)).toBe("1 day ignored");
    expect(formatDaysIgnored(5)).toBe("5 days ignored");
    expect(formatDaysIgnored(6, true)).toBe("Acknowledged after 6 days");
  });
});

