import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
