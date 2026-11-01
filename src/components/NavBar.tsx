"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <nav className="border-b border-line bg-card">
      <div className="max-w-content mx-auto px-md py-sm flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Link href="/incidents" className="text-lg font-semibold text-ink hover:text-primary transition-colors">
            Paper Trail
          </Link>
          <span className="text-xs uppercase tracking-wider text-muted font-mono">
            Renter Evidence Log
          </span>
        </div>

        <div className="flex items-center gap-md text-sm">
          {session ? (
            <div className="flex items-center gap-sm">
              <span className="text-muted">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Tenant"}
                {user?.unit ? `, Unit ${user.unit}` : ""}
              </span>
              <span className="text-line">&middot;</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-muted hover:text-ink transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-sm">
              <Link href="/login" className="text-muted hover:text-ink">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

