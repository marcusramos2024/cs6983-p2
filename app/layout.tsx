import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper Trail",
  description: "A renter's evidence log that turns a landlord fight into a case file.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink flex flex-col">
        <header className="border-b border-line bg-card">
          <div className="max-w-[960px] mx-auto px-md py-3 flex items-center justify-between">
            <Link href="/incidents" className="font-semibold text-lg text-ink hover:text-primary transition-colors">
              Paper Trail
            </Link>
            <nav className="flex items-center gap-sm text-sm text-muted">
              <span>Tenant</span>
              <span>&middot;</span>
              <Link href="/incidents/new" className="text-primary hover:underline font-medium">
                Log incident
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-[960px] w-full mx-auto p-md sm:py-lg">
          {children}
        </main>
      </body>
    </html>
  );
}
