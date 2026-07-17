import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tftdle.com"),
  title: { default: "TFTdle — Daily TFT Champion Guessing Game", template: "%s · TFTdle" },
  description: "Play two daily Teamfight Tactics champion puzzles: Standard for the latest set and Wild for every historical set.",
  applicationName: "TFTdle",
  alternates: { canonical: "/" },
  openGraph: { title: "TFTdle", description: "Two daily TFT champion puzzles: Standard and Wild.", url: "/", siteName: "TFTdle", type: "website" },
  twitter: { card: "summary_large_image", title: "TFTdle", description: "Two daily TFT champion puzzles: Standard and Wild." },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#101722" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased"><TooltipProvider>{children}</TooltipProvider></body>
    </html>
  );
}
