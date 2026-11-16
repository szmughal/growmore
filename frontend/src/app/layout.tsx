import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/ThemeContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Grow more | Pakistan Stock Exchange (PSX) Financial Intelligence & Wealth Management",
  description: "Institutional-grade financial intelligence, valuation models & multi-asset wealth management platform covering the Pakistan Stock Exchange (PSX / KSE 100), Mutual Funds, and Commodities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8fafc] text-slate-900 min-h-screen`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
