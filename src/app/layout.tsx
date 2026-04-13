import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hello! SlotBuddy — Your booking page, live in 5 minutes",
  description:
    "Simple, affordable appointment booking for small service businesses. Set up your booking page and let customers self-schedule.",
  metadataBase: new URL("https://helloslotbuddy.com"),
  openGraph: {
    title: "Hello! SlotBuddy — Your booking page, live in 5 minutes",
    description:
      "Simple, affordable appointment booking for small service businesses. Set up your booking page and let customers self-schedule.",
    url: "https://helloslotbuddy.com",
    siteName: "Hello! SlotBuddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hello! SlotBuddy — Your booking page, live in 5 minutes",
    description:
      "Simple, affordable appointment booking for small service businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="bg-cream font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
