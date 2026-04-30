import type { Metadata } from "next";
import "./globals.css";
import { CivicProvider } from "./context/CivicContext";
import CivicNavigation from "./components/CivicNavigation";
import FooterGate from "./components/FooterGate";
import RequireLogin from "./components/RequireLogin";
import DataPreloader from "./components/DataPreloader";

export const metadata: Metadata = {
  title: "Charlotte Data Portal | Civic Intelligence Platform",
  description: "Charlotte, understood through data. An official civic intelligence platform providing transparent, accessible data for residents, businesses, and policymakers.",
  keywords: "Charlotte, North Carolina, open data, civic data, city data, government data, Charlotte NC",
  authors: [{ name: "City of Charlotte" }],
  openGraph: {
    title: "Charlotte Data Portal",
    description: "Charlotte, understood through data.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <CivicProvider>
            <DataPreloader />
            <CivicNavigation />
            <main className="flex-1">{children}</main>
            <FooterGate />
        </CivicProvider>
      </body>
    </html>
  );
}
