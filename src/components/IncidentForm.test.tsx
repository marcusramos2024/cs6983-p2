import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IncidentForm from "./IncidentForm";

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("IncidentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders all required form fields", () => {
    render(<IncidentForm />);

    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/When did you report it/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How did you report it/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log incident/i })).toBeInTheDocument();
  });

  it("shows validation error when title is empty on submit", async () => {
    render(<IncidentForm />);

    fireEvent.click(screen.getByRole("button", { name: /Log incident/i }));

    expect(await screen.findByText(/Title is required/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows validation error when title exceeds 120 chars", async () => {
    render(<IncidentForm />);

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "a".repeat(125) } });
    fireEvent.click(screen.getByRole("button", { name: /Log incident/i }));

    expect(await screen.findByText(/cannot exceed 120 characters/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows validation error when reported date is missing or in future", async () => {
    render(<IncidentForm />);

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "Leaky ceiling" } });

    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    const dateInput = screen.getByLabelText(/When did you report it/i);
    fireEvent.change(dateInput, { target: { value: futureDate } });

    fireEvent.click(screen.getByRole("button", { name: /Log incident/i }));

    expect(await screen.findByText(/cannot be in the future/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits valid form and redirects to incident timeline", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ incident: { id: "new-inc-456" } }),
    });

    render(<IncidentForm />);

    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "leak" } });
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Kitchen pipe burst" } });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Cabinet flooded" },
    });

    const pastDate = new Date(Date.now() - 3600000).toISOString().slice(0, 16);
    fireEvent.change(screen.getByLabelText(/When did you report it/i), {
      target: { value: pastDate },
    });
    fireEvent.change(screen.getByLabelText(/How did you report it/i), {
      target: { value: "text" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Log incident/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/incidents", expect.anything());
      expect(mockPush).toHaveBeenCalledWith("/incidents/new-inc-456");
    });
  });
});
