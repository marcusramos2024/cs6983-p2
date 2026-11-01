import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Paper Trail - Renter Evidence Log",
  description: "A renter's evidence log that turns a landlord fight into a case file.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink min-h-screen">
        <Providers>
          <NavBar />
          <main className="max-w-content mx-auto px-md py-lg">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

