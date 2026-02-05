import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Leraie Tools - Free Developer Tools",
  description:
    "A collection of free, fast, and privacy-focused tools for developers. 2FA Generator, Address Generator, Card Generator, and more.",
  keywords: [
    "developer tools",
    "2fa generator",
    "totp",
    "address generator",
    "card generator",
    "free tools",
  ],
  authors: [{ name: "Leraie" }],
  openGraph: {
    title: "Leraie Tools - Free Developer Tools",
    description:
      "A collection of free, fast, and privacy-focused tools for developers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
