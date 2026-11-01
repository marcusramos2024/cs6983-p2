import { z } from "zod";

export const INCIDENT_CATEGORIES = [
  "PEST",
  "HEAT",
  "LEAK",
  "APPLIANCE",
  "OTHER",
] as const;

export const REPORTED_VIA_CHANNELS = [
  "TEXT",
  "EMAIL",
  "PORTAL",
  "PHONE",
  "IN_PERSON",
] as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
] as const;

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB

export const photoUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  size: z.number().max(MAX_PHOTO_BYTES, "Photo must be 10 MB or smaller"),
  type: z.enum(ALLOWED_IMAGE_TYPES, {
    errorMap: () => ({ message: "Only JPEG, PNG, and HEIC files are allowed" }),
  }),
});

export const createIncidentSchema = z.object({
  category: z.enum(INCIDENT_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
  reportedAt: z
    .union([z.string().min(1, "Reported date is required"), z.date()])
    .refine(
      (val) => {
        const date = typeof val === "string" ? new Date(val) : val;
        return !isNaN(date.getTime()) && date.getTime() <= Date.now();
      },
      { message: "Reported date cannot be in the future" }
    ),
  reportedVia: z.enum(REPORTED_VIA_CHANNELS, {
    errorMap: () => ({ message: "Please select how you reported it" }),
  }),
  photos: z
    .array(
      z.object({
        url: z.string(),
        name: z.string().optional(),
      })
    )
    .max(5, "Maximum of 5 photos allowed")
    .default([]),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
