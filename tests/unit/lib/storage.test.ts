import { describe, it, expect, vi, beforeEach } from "vitest";
import { savePhoto } from "@/lib/storage";
import fs from "fs/promises";

vi.mock("fs/promises", () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("lib/storage.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves photo buffer to upload directory in dev/test environment", async () => {
    const buffer = Buffer.from("fake-image-bytes");
    const resultUrl = await savePhoto("sink.jpg", buffer);

    expect(fs.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/\.jpg$/),
      buffer
    );
    expect(resultUrl).toMatch(/^\/uploads\/[0-9a-f-]+\.jpg$/);
  });

  it("handles filename without extension by defaulting to .jpg", async () => {
    const buffer = Buffer.from("bytes");
    const resultUrl = await savePhoto("test-photo", buffer);

    expect(resultUrl).toMatch(/^\/uploads\/[0-9a-f-]+\.jpg$/);
  });
});
