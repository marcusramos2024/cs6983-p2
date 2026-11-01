"use client";

import React, { useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_PHOTO_BYTES } from "@/lib/validation/incident-schema";

export interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
}

interface PhotoUploaderProps {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  disabled?: boolean;
  maxPhotos?: number;
  category?: string;
}

export function PhotoUploader({
  photos,
  onPhotosChange,
  disabled = false,
  maxPhotos = 5,
  category = "Incident",
}: PhotoUploaderProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (photos.length + files.length > maxPhotos) {
      setErrorMessage(`Maximum of ${maxPhotos} photos allowed.`);
      e.target.value = "";
      return;
    }

    const newPhotos: UploadedPhoto[] = [];

    for (const file of files) {
      const isAllowedType = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(
        file.type
      );
      if (!isAllowedType) {
        setErrorMessage("Only JPEG, PNG, and HEIC files are allowed.");
        e.target.value = "";
        return;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        setErrorMessage("Photo must be 10 MB or smaller.");
        e.target.value = "";
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: crypto.randomUUID(),
        url: previewUrl,
        name: file.name,
      });
    }

    onPhotosChange([...photos, ...newPhotos]);
    e.target.value = "";
  };

  const handleRemove = (idToRemove: string) => {
    setErrorMessage(null);
    onPhotosChange(photos.filter((p) => p.id !== idToRemove));
  };

  return (
    <div className="space-y-sm">
      <div className="flex items-center justify-between">
        <label
          htmlFor="photo-upload"
          className="block text-sm font-semibold text-ink cursor-pointer"
        >
          Upload photos
        </label>
        <span className="text-xs text-muted">
          {photos.length} / {maxPhotos} photos
        </span>
      </div>

      <div className="flex items-center gap-sm">
        <label
          htmlFor="photo-upload"
          className={`inline-flex items-center justify-center px-4 py-2 border border-line rounded-md text-sm font-medium bg-card text-ink hover:bg-paper cursor-pointer ${
            disabled || photos.length >= maxPhotos ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Choose files
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/png,image/heic,.heic"
            multiple
            className="sr-only"
            disabled={disabled || photos.length >= maxPhotos}
            onChange={handleFileChange}
          />
        </label>
        <span className="text-xs text-muted">JPEG, PNG or HEIC, up to 10 MB each</span>
      </div>

      {errorMessage && (
        <p className="text-xs text-open font-medium" role="alert">
          {errorMessage}
        </p>
      )}

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-sm pt-xs" aria-label="Photos preview">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative w-[72px] h-[72px] rounded-sm border border-line overflow-hidden bg-paper group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`${category} photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(photo.id)}
                disabled={disabled}
                aria-label={`Remove photo ${photo.name}`}
                className="absolute top-1 right-1 bg-ink/75 hover:bg-ink text-card rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

