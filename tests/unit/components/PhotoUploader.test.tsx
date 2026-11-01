import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PhotoUploader } from "@/components/incidents/PhotoUploader";

describe("components/incidents/PhotoUploader", () => {
  it("renders upload button and photo count", () => {
    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={[]} onPhotosChange={onPhotosChange} />);

    expect(screen.getByLabelText(/upload photos/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 5 photos/i)).toBeInTheDocument();
  });

  it("displays previews and remove buttons for existing photos", () => {
    const onPhotosChange = vi.fn();
    const photos = [
      { id: "p1", url: "https://example.com/p1.jpg", name: "sink1.jpg" },
      { id: "p2", url: "https://example.com/p2.jpg", name: "sink2.jpg" },
    ];

    render(<PhotoUploader photos={photos} onPhotosChange={onPhotosChange} />);

    expect(screen.getByText(/2 \/ 5 photos/i)).toBeInTheDocument();
    const removeButtons = screen.getAllByRole("button", { name: /remove photo/i });
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(onPhotosChange).toHaveBeenCalledWith([photos[1]]);
  });

  it("shows error when trying to upload more than 5 photos", async () => {
    const onPhotosChange = vi.fn();
    const fivePhotos = [
      { id: "1", url: "1.jpg", name: "1.jpg" },
      { id: "2", url: "2.jpg", name: "2.jpg" },
      { id: "3", url: "3.jpg", name: "3.jpg" },
      { id: "4", url: "4.jpg", name: "4.jpg" },
      { id: "5", url: "5.jpg", name: "5.jpg" },
    ];

    render(<PhotoUploader photos={fivePhotos} onPhotosChange={onPhotosChange} />);

    const input = screen.getByLabelText(/upload photos/i);
    const file = new File(["dummy"], "extra.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/maximum of 5 photos allowed/i)).toBeInTheDocument();
    });
    expect(onPhotosChange).not.toHaveBeenCalled();
  });

  it("shows error for unsupported file types", async () => {
    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={[]} onPhotosChange={onPhotosChange} />);

    const input = screen.getByLabelText(/upload photos/i);
    const file = new File(["dummy"], "notes.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/only jpeg, png, and heic/i)).toBeInTheDocument();
    });
    expect(onPhotosChange).not.toHaveBeenCalled();
  });

  it("shows error for files exceeding 10 MB", async () => {
    const onPhotosChange = vi.fn();
    render(<PhotoUploader photos={[]} onPhotosChange={onPhotosChange} />);

    const input = screen.getByLabelText(/upload photos/i);
    const hugeBuffer = new Uint8Array(11 * 1024 * 1024);
    const file = new File([hugeBuffer], "giant.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/photo must be 10 mb or smaller/i)).toBeInTheDocument();
    });
    expect(onPhotosChange).not.toHaveBeenCalled();
  });
});
