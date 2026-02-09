import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { AppShell } from "@/components/layout/app-shell";
import { publicEnv } from "@/lib/public-env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JSONDeck",
  description:
    "JSONDeck brings a premium developer workspace for JSON, APIs, and data transformations.",
  metadataBase: new URL(publicEnv.siteUrl),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
