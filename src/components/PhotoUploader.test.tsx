import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PhotoUploader from "./PhotoUploader";

describe("PhotoUploader", () => {
  it("renders upload button and empty state", () => {
    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={[]} onPhotosChange={onPhotosChange} />);

    expect(screen.getByText(/Attach photos/i)).toBeInTheDocument();
    expect(screen.getByText(/Up to 5 photos/i)).toBeInTheDocument();
  });

  it("renders thumbnail previews with remove buttons for attached photos", () => {
    const photos = [
      {
        url: "data:image/jpeg;base64,sample1",
        filename: "test1.jpg",
        size: 1024,
        mimeType: "image/jpeg",
      },
      {
        url: "data:image/png;base64,sample2",
        filename: "test2.png",
        size: 2048,
        mimeType: "image/png",
      },
    ];

    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={photos} onPhotosChange={onPhotosChange} />);

    expect(screen.getAllByAltText(/Preview/i)).toHaveLength(2);
    const removeButtons = screen.getAllByRole("button", { name: /Remove photo/i });
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(onPhotosChange).toHaveBeenCalledWith([photos[1]]);
  });

  it("shows an error when adding file exceeding 10 MB", async () => {
    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={[]} onPhotosChange={onPhotosChange} />);

    const input = screen.getByLabelText(/Upload photos/i) as HTMLInputElement;
    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(await screen.findByText(/exceeds 10 MB/i)).toBeInTheDocument();
    expect(onPhotosChange).not.toHaveBeenCalled();
  });

  it("shows an error when adding unsupported file type", async () => {
    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={[]} onPhotosChange={onPhotosChange} />);

    const input = screen.getByLabelText(/Upload photos/i) as HTMLInputElement;
    const textFile = new File(["dummy text"], "doc.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [textFile] } });

    expect(await screen.findByText(/JPEG, PNG, or HEIC/i)).toBeInTheDocument();
    expect(onPhotosChange).not.toHaveBeenCalled();
  });

  it("prevents selecting more than 5 photos", () => {
    const photos = Array.from({ length: 5 }).map((_, i) => ({
      url: `data:image/jpeg;base64,pic${i}`,
      filename: `pic${i}.jpg`,
      size: 1000,
      mimeType: "image/jpeg",
    }));

    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={photos} onPhotosChange={onPhotosChange} />);

    expect(screen.getByText(/Maximum 5 photos reached/i)).toBeInTheDocument();
  });
});

