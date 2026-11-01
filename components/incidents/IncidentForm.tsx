"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  INCIDENT_CATEGORIES,
  REPORTED_VIA_CHANNELS,
  createIncidentSchema,
} from "@/lib/validation/incident-schema";
import { PhotoUploader, type UploadedPhoto } from "./PhotoUploader";

const CATEGORY_LABELS: Record<string, string> = {
  PEST: "Pest",
  HEAT: "Heat",
  LEAK: "Leak",
  APPLIANCE: "Appliance",
  OTHER: "Other",
};

const CHANNEL_LABELS: Record<string, string> = {
  TEXT: "Text",
  EMAIL: "Email",
  PORTAL: "Portal",
  PHONE: "Phone",
  IN_PERSON: "In person",
};

export function IncidentForm() {
  const router = useRouter();

  const [category, setCategory] = useState<string>("LEAK");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportedAt, setReportedAt] = useState("");
  const [reportedVia, setReportedVia] = useState<string>("TEXT");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const payload = {
      category,
      title: title.trim(),
      description: description.trim(),
      reportedAt: reportedAt ? new Date(reportedAt).toISOString() : "",
      reportedVia,
      photos: photos.map((p) => ({ url: p.url, name: p.name })),
    };

    const parsed = createIncidentSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const pathKey = String(issue.path[0] || "form");
        if (!fieldErrors[pathKey]) {
          fieldErrors[pathKey] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error?.message || "Failed to log incident");
        return;
      }

      router.push(`/incidents/${data.data.id}`);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-card border border-line rounded-md p-md sm:p-lg space-y-md max-w-2xl mx-auto shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold text-ink">Log an incident</h1>
        <p className="text-sm text-muted mt-1">
          Record a new maintenance or safety problem with dates and photos.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="p-sm bg-open/10 border border-open rounded-sm text-sm text-open font-medium"
        >
          {serverError}
        </div>
      )}

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-ink mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-line rounded-md bg-card text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        >
          {INCIDENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] || cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-open font-medium mt-1" role="alert">
            {errors.category}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-ink mb-1">
          Incident title <span className="text-open">*</span>
        </label>
        <input
          id="title"
          type="text"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Leak under kitchen sink"
          disabled={isSubmitting}
          aria-required="true"
          className="w-full px-3 py-2 border border-line rounded-md bg-card text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.title ? (
            <p className="text-xs text-open font-medium" role="alert">
              {errors.title}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted">{title.length} / 120</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-ink mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? Where is it located in the unit?"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-line rounded-md bg-card text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description ? (
            <p className="text-xs text-open font-medium" role="alert">
              {errors.description}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted">{description.length} / 2000</span>
        </div>
      </div>

      {/* Date & Time Reported */}
      <div>
        <label htmlFor="reportedAt" className="block text-sm font-semibold text-ink mb-1">
          Date and time reported <span className="text-open">*</span>
        </label>
        <input
          id="reportedAt"
          type="datetime-local"
          value={reportedAt}
          onChange={(e) => setReportedAt(e.target.value)}
          disabled={isSubmitting}
          aria-required="true"
          className="w-full px-3 py-2 border border-line rounded-md bg-card text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
        {errors.reportedAt && (
          <p className="text-xs text-open font-medium mt-1" role="alert">
            {errors.reportedAt}
          </p>
        )}
      </div>

      {/* How did you report it? */}
      <div>
        <label htmlFor="reportedVia" className="block text-sm font-semibold text-ink mb-1">
          How did you report it? <span className="text-open">*</span>
        </label>
        <select
          id="reportedVia"
          value={reportedVia}
          onChange={(e) => setReportedVia(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-line rounded-md bg-card text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        >
          {REPORTED_VIA_CHANNELS.map((ch) => (
            <option key={ch} value={ch}>
              {CHANNEL_LABELS[ch] || ch}
            </option>
          ))}
        </select>
        {errors.reportedVia && (
          <p className="text-xs text-open font-medium mt-1" role="alert">
            {errors.reportedVia}
          </p>
        )}
      </div>

      {/* Photo Uploader */}
      <PhotoUploader
        photos={photos}
        onPhotosChange={setPhotos}
        disabled={isSubmitting}
        category={CATEGORY_LABELS[category] || "Incident"}
      />

      {/* Actions */}
      <div className="pt-sm flex items-center justify-end gap-sm">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-primary text-card hover:bg-primary/90 font-medium rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {isSubmitting ? "Submitting..." : "Log incident"}
        </button>
      </div>
    </form>
  );
}
