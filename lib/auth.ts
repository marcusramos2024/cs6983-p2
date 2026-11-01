import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: "TENANT" | "MANAGER" | "ORGANIZER";
  buildingId?: string | null;
  unit?: string | null;
}

export class AuthError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Stub for credentials provider, issue #3 implements full auth
        if (!credentials?.email) return null;
        return {
          id: "test-user-id",
          email: credentials.email,
          name: "Test User",
          role: "TENANT",
          buildingId: "bld-1",
          unit: "4B",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as SessionUser).role;
        token.buildingId = (user as unknown as SessionUser).buildingId;
        token.unit = (user as unknown as SessionUser).unit;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as SessionUser).id = token.id as string;
        (session.user as unknown as SessionUser).role = token.role as "TENANT" | "MANAGER" | "ORGANIZER";
        (session.user as unknown as SessionUser).buildingId = token.buildingId as string;
        (session.user as unknown as SessionUser).unit = token.unit as string;
      }
      return session;
    },
  },
};

/**
 * Returns the currently signed-in user session, or null if signed out.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

/**
 * Ensures the signed-in user has one of the allowed roles, throwing AuthError (401/403).
 */
export async function requireRole(allowedRoles: string | string[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError(401, "Authentication required");
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    throw new AuthError(403, "Forbidden: insufficient permissions");
  }

  return user;
}
