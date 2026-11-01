import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSessionUser, requireRole, AuthError, authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

describe("lib/auth.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSessionUser", () => {
    it("returns null when there is no active session", async () => {
      (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it("returns user session when authenticated", async () => {
      const mockUser = {
        id: "u1",
        email: "dana@example.com",
        role: "TENANT",
        buildingId: "b1",
        unit: "4B",
      };
      (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: mockUser,
      });

      const user = await getSessionUser();
      expect(user).toEqual(mockUser);
    });
  });

  describe("requireRole", () => {
    it("throws 401 AuthError when signed out", async () => {
      (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      await expect(requireRole("TENANT")).rejects.toThrow(AuthError);
      await expect(requireRole("TENANT")).rejects.toThrow("Authentication required");
    });

    it("throws 403 AuthError when user role is not in allowed roles", async () => {
      (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: "u2", email: "mgr@example.com", role: "MANAGER" },
      });
      await expect(requireRole("TENANT")).rejects.toThrow(AuthError);
      await expect(requireRole(["TENANT"])).rejects.toThrow("Forbidden: insufficient permissions");
    });

    it("returns user when user has the required role", async () => {
      const mockTenant = { id: "u3", email: "tenant@example.com", role: "TENANT" };
      (getServerSession as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: mockTenant,
      });

      const user = await requireRole("TENANT");
      expect(user).toEqual(mockTenant);
    });
  });

  describe("authOptions callbacks", () => {
    it("populates jwt token from user", async () => {
      const jwtCallback = authOptions.callbacks?.jwt;
      if (!jwtCallback) throw new Error("Missing jwt callback");

      const token = await jwtCallback({
        token: {},
        user: {
          id: "u1",
          email: "dana@example.com",
          role: "TENANT",
          buildingId: "b1",
          unit: "4B",
        } as any,
        account: null,
      });

      expect(token.id).toBe("u1");
      expect(token.role).toBe("TENANT");
    });

    it("populates session user from token", async () => {
      const sessionCallback = authOptions.callbacks?.session;
      if (!sessionCallback) throw new Error("Missing session callback");

      const session = await sessionCallback({
        session: { expires: "2099-01-01", user: { email: "dana@example.com" } } as any,
        token: { id: "u1", role: "TENANT", buildingId: "b1", unit: "4B" } as any,
        user: {} as any,
      } as any);

      expect((session.user as any).id).toBe("u1");
      expect((session.user as any).role).toBe("TENANT");
    });
  });
});
