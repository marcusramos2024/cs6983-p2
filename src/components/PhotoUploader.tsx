"use client";

import React, { useState, ChangeEvent } from "react";
import { PhotoInput, validatePhotoFile, MAX_PHOTOS_COUNT } from "@/lib/validation";

interface PhotoUploaderProps {
  photos: PhotoInput[];
  onPhotosChange: (photos: PhotoInput[]) => void;
  disabled?: boolean;
}

export default function PhotoUploader({
  photos,
  onPhotosChange,
  disabled = false,
}: PhotoUploaderProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > MAX_PHOTOS_COUNT) {
      setErrorMessage(`Maximum ${MAX_PHOTOS_COUNT} photos allowed. You already have ${photos.length}.`);
      e.target.value = "";
      return;
    }

    const newPhotos: PhotoInput[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validatePhotoFile(file.name, file.type, file.size);

      if (!validation.valid) {
        setErrorMessage(validation.error || "Invalid file");
        e.target.value = "";
        return;
      }

      // Convert file to data URL for preview and submission
      const dataUrl = await readFileAsDataUrl(file);
      newPhotos.push({
        url: dataUrl,
        filename: file.name,
        size: file.size,
        mimeType: file.type || "image/jpeg",
      });
    }

    onPhotosChange([...photos, ...newPhotos]);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-sm">
      <div className="flex items-center justify-between">
        <label htmlFor="photo-file-input" className="block text-sm font-medium text-ink">
          Attach photos
        </label>
        <span className="text-xs text-muted">
          {photos.length} / {MAX_PHOTOS_COUNT} (JPEG, PNG, HEIC up to 10 MB)
        </span>
      </div>

      <div className="flex flex-wrap gap-sm items-center">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative w-20 h-20 rounded-md border border-line bg-paper overflow-hidden group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute top-1 right-1 bg-ink/75 hover:bg-ink text-white rounded-full p-1 text-xs w-5 h-5 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              &times;
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS_COUNT && (
          <label
            htmlFor="photo-file-input"
            className={`w-20 h-20 border-2 border-dashed border-line rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary text-muted hover:text-primary transition-colors ${
              disabled ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-[11px] mt-1">Add photo</span>
          </label>
        )}
      </div>

      <input
        id="photo-file-input"
        aria-label="Upload photos"
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif"
        multiple
        disabled={disabled || photos.length >= MAX_PHOTOS_COUNT}
        onChange={handleFileChange}
        className="sr-only"
      />

      <p className="text-xs text-muted">
        Up to 5 photos, JPEG/PNG/HEIC, 10 MB each.
      </p>

      {photos.length >= MAX_PHOTOS_COUNT && (
        <p className="text-xs text-muted">Maximum 5 photos reached.</p>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-open">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

