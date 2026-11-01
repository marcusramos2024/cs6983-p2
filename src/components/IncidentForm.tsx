"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import PhotoUploader from "./PhotoUploader";
import { PhotoInput, VALID_CATEGORIES, VALID_REPORTED_VIA, validateIncidentInput } from "@/lib/validation";

function formatLocalDateTime(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function IncidentForm() {
  const router = useRouter();

  const [category, setCategory] = useState<string>("leak");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [reportedAt, setReportedAt] = useState<string>(() => formatLocalDateTime());
  const [reportedVia, setReportedVia] = useState<string>("text");
  const [photos, setPhotos] = useState<PhotoInput[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // Convert local datetime-local string to ISO Date string
    const reportedAtDate = reportedAt ? new Date(reportedAt).toISOString() : "";

    const payload = {
      title,
      category,
      description: description.trim() || undefined,
      reportedAt: reportedAtDate,
      reportedVia,
      photos,
    };

    // Client-side validation
    const validation = validateIncidentInput(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setServerError(data.error || "Failed to log incident");
        }
        setIsSubmitting(false);
        return;
      }

      router.push(`/incidents/${data.incident.id}`);
    } catch (err: any) {
      setServerError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md bg-card p-md rounded-md border border-line">
      {serverError && (
        <div role="alert" className="p-sm text-sm text-open bg-open/10 border border-open rounded-sm">
          {serverError}
        </div>
      )}

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-ink mb-xs">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-sm py-xs border border-line rounded-sm bg-card text-ink focus:outline-none focus:border-primary capitalize"
        >
          {VALID_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p role="alert" className="mt-xs text-xs text-open">
            {errors.category}
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <div className="flex justify-between items-center mb-xs">
          <label htmlFor="title" className="block text-sm font-medium text-ink">
            Title
          </label>
          <span className="text-xs text-muted">{title.length} / 120</span>
        </div>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Leak under kitchen sink"
          disabled={isSubmitting}
          className="w-full px-sm py-xs border border-line rounded-sm bg-card text-ink focus:outline-none focus:border-primary"
        />
        {errors.title && (
          <p role="alert" className="mt-xs text-xs text-open">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex justify-between items-center mb-xs">
          <label htmlFor="description" className="block text-sm font-medium text-ink">
            Description <span className="text-muted font-normal">(optional)</span>
          </label>
          <span className="text-xs text-muted">{description.length} / 2000</span>
        </div>
        <textarea
          id="description"
          rows={4}
          value={description}
          maxLength={2000}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened? Where is it located? Any damage caused?"
          disabled={isSubmitting}
          className="w-full px-sm py-xs border border-line rounded-sm bg-card text-ink focus:outline-none focus:border-primary"
        />
        {errors.description && (
          <p role="alert" className="mt-xs text-xs text-open">
            {errors.description}
          </p>
        )}
      </div>

      {/* When reported */}
      <div>
        <label htmlFor="reportedAt" className="block text-sm font-medium text-ink mb-xs">
          When did you report it to the landlord?
        </label>
        <input
          id="reportedAt"
          type="datetime-local"
          value={reportedAt}
          onChange={(e) => setReportedAt(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-sm py-xs border border-line rounded-sm bg-card text-ink focus:outline-none focus:border-primary"
        />
        {errors.reportedAt && (
          <p role="alert" className="mt-xs text-xs text-open">
            {errors.reportedAt}
          </p>
        )}
      </div>

      {/* How reported */}
      <div>
        <label htmlFor="reportedVia" className="block text-sm font-medium text-ink mb-xs">
          How did you report it?
        </label>
        <select
          id="reportedVia"
          value={reportedVia}
          onChange={(e) => setReportedVia(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-sm py-xs border border-line rounded-sm bg-card text-ink focus:outline-none focus:border-primary capitalize"
        >
          {VALID_REPORTED_VIA.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        {errors.reportedVia && (
          <p role="alert" className="mt-xs text-xs text-open">
            {errors.reportedVia}
          </p>
        )}
      </div>

      {/* Photo Uploader */}
      <PhotoUploader
        photos={photos}
        onPhotosChange={setPhotos}
        disabled={isSubmitting}
      />
      {errors.photos && (
        <p role="alert" className="text-xs text-open">
          {errors.photos}
        </p>
      )}

      {/* Submit button */}
      <div className="pt-sm">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-md py-sm bg-primary text-white rounded-sm font-medium hover:bg-primary/90 focus:outline-none disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Logging incident..." : "Log incident"}
        </button>
      </div>
    </form>
  );
}
