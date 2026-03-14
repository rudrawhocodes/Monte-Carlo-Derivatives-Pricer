import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MC Derivatives Pricer",
  description:
    "GBM Monte Carlo pricer for Indian index options with variance reduction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
