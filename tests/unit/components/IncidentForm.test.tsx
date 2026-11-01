import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IncidentForm } from "@/components/incidents/IncidentForm";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("components/incidents/IncidentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("renders all required fields with accessible labels", () => {
    render(<IncidentForm />);

    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/incident title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date and time reported/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/how did you report it\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log incident/i })).toBeInTheDocument();
  });

  it("shows inline errors under fields on empty submission", async () => {
    render(<IncidentForm />);

    fireEvent.click(screen.getByRole("button", { name: /log incident/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/reported date is required/i)).toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("shows error if reported-at date is in the future", async () => {
    render(<IncidentForm />);

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "LEAK" } });
    fireEvent.change(screen.getByLabelText(/incident title/i), {
      target: { value: "Water leak" },
    });
    fireEvent.change(screen.getByLabelText(/date and time reported/i), {
      target: { value: "2099-01-01T12:00" },
    });
    fireEvent.change(screen.getByLabelText(/how did you report it\?/i), {
      target: { value: "TEXT" },
    });

    fireEvent.click(screen.getByRole("button", { name: /log incident/i }));

    await waitFor(() => {
      expect(screen.getByText(/reported date cannot be in the future/i)).toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("submits valid form data, disables submit while in flight, and redirects on success", async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: "inc-new-123" } }),
    });

    render(<IncidentForm />);

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "HEAT" } });
    fireEvent.change(screen.getByLabelText(/incident title/i), {
      target: { value: "No heat in bedroom" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Radiator clangs and stays ice cold." },
    });
    fireEvent.change(screen.getByLabelText(/date and time reported/i), {
      target: { value: "2026-10-30T10:00" },
    });
    fireEvent.change(screen.getByLabelText(/how did you report it\?/i), {
      target: { value: "EMAIL" },
    });

    const submitBtn = screen.getByRole("button", { name: /log incident/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/incidents", expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith("/incidents/inc-new-123");
    });
  });
});

