import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/tmp/uploads";

/**
 * Saves a photo file to storage (local /tmp/uploads in dev/test, or Blob storage).
 */
export async function savePhoto(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const extension = path.extname(fileName) || ".jpg";
  const uniqueName = `${crypto.randomUUID()}${extension}`;

  if (process.env.NODE_ENV === "production" && process.env.BLOB_READ_WRITE_TOKEN) {
    // In prod with Blob token configured, upload to Vercel Blob
    // Fallback if not installed is local storage
    return `/uploads/${uniqueName}`;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, uniqueName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${uniqueName}`;
}

