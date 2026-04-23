import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { SupportButton } from "@/components/SupportButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RobloxPH Market — Bilhin at Ibenta ang Roblox Items sa Pilipinas",
  description:
    "Ang pinagkakatiwalaang marketplace para sa pagbili at pagbebenta ng Roblox items at accounts sa Pilipinas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fil"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <SupportButton />
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 RobloxPH Market · Para sa mga Filipino Roblox Traders
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
