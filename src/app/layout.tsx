import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlbionMarket — Prix du marché Albion Online",
  description:
    "Suivi des prix du marché Albion Online : recherche d'objets, prix par ville et historique.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 text-neutral-100">
        <QueryProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
