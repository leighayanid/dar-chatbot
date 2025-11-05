import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { TeamProvider } from "@/lib/teams/team-context";
import { UISizeProvider } from "@/contexts/ui-size-context";
import { ThemeProvider } from "@/lib/theme/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Accomplishment Report",
  description: "Track and reflect on your daily achievements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <UISizeProvider>
            <AuthProvider>
              <TeamProvider>{children}</TeamProvider>
            </AuthProvider>
          </UISizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
