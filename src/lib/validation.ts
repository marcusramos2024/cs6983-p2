export interface PhotoInput {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IncidentInput {
  title: string;
  category: string;
  description?: string;
  reportedAt: string;
  reportedVia: string;
  photos?: PhotoInput[];
}

export const VALID_CATEGORIES = ["pest", "heat", "leak", "appliance", "other"] as const;
export const VALID_REPORTED_VIA = ["text", "email", "portal", "phone", "in person"] as const;
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_PHOTOS_COUNT = 5;

export function validatePhotoFile(
  filename: string,
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  const normalizedType = mimeType.toLowerCase();
  const isAllowedType =
    ALLOWED_MIME_TYPES.includes(normalizedType as any) ||
    filename.toLowerCase().endsWith(".heic") ||
    filename.toLowerCase().endsWith(".heif") ||
    filename.toLowerCase().endsWith(".jpg") ||
    filename.toLowerCase().endsWith(".jpeg") ||
    filename.toLowerCase().endsWith(".png");

  if (!isAllowedType) {
    return {
      valid: false,
      error: "Photos must be in JPEG, PNG, or HEIC format.",
    };
  }

  if (size > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: "Photo size exceeds 10 MB limit.",
    };
  }

  return { valid: true };
}

export function validateIncidentInput(input: Partial<IncidentInput>): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Title validation
  if (!input.title || input.title.trim().length === 0) {
    errors.title = "Title is required.";
  } else if (input.title.length > 120) {
    errors.title = "Title cannot exceed 120 characters.";
  }

  // Category validation
  if (!input.category || !VALID_CATEGORIES.includes(input.category as any)) {
    errors.category = `Category must be one of: ${VALID_CATEGORIES.join(", ")}.`;
  }

  // Description validation
  if (input.description && input.description.length > 2000) {
    errors.description = "Description cannot exceed 2000 characters.";
  }

  // ReportedAt validation
  if (!input.reportedAt) {
    errors.reportedAt = "Reported date and time is required.";
  } else {
    const reportedDate = new Date(input.reportedAt);
    if (isNaN(reportedDate.getTime())) {
      errors.reportedAt = "Invalid date format.";
    } else {
      // Allow up to 1 minute clock skew
      const now = new Date(Date.now() + 60 * 1000);
      if (reportedDate > now) {
        errors.reportedAt = "Reported date and time cannot be in the future.";
      }
    }
  }

  // ReportedVia validation
  if (!input.reportedVia || !VALID_REPORTED_VIA.includes(input.reportedVia as any)) {
    errors.reportedVia = `Reported method must be one of: ${VALID_REPORTED_VIA.join(", ")}.`;
  }

  // Photos validation
  if (input.photos) {
    if (input.photos.length > MAX_PHOTOS_COUNT) {
      errors.photos = `Up to 5 photos allowed. You attached ${input.photos.length}.`;
    } else {
      for (const [index, photo] of input.photos.entries()) {
        const photoVal = validatePhotoFile(photo.filename, photo.mimeType, photo.size);
        if (!photoVal.valid) {
          errors[`photo_${index}`] = photoVal.error!;
          errors.photos = photoVal.error!;
          break;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
