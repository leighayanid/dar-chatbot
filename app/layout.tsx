import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { TeamProvider } from "@/lib/teams/team-context";
import { SubscriptionProvider } from "@/lib/subscription/subscription-context";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

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
              <SubscriptionProvider>
                <TeamProvider>{children}</TeamProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </UISizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
