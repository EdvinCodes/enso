import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Viewport Config
export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // <--- Esto hace que se sienta como App nativa (no zoom)
};

// 2. Metadata Profesional
export const metadata: Metadata = {
  title: {
    default: "ENSO | Subscription Intelligence",
    template: "%s | ENSO",
  },
  description:
    "Stop losing money on forgotten subscriptions. ENSO provides local-first, privacy-focused financial clarity for your recurring expenses.",
  keywords: [
    "Finance",
    "Subscription Manager",
    "SaaS",
    "Privacy First",
    "Local Database",
  ],
  authors: [{ name: "EdvinCodes" }],
  creator: "EdvinCodes",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://enso.vercel.app",
    title: "ENSO | Control Your Recurring Expenses",
    description:
      "Privacy-first subscription tracker. No bank connection required.",
    siteName: "ENSO",
  },

  twitter: {
    card: "summary_large_image",
    title: "ENSO | Subscription Intelligence",
    description:
      "Privacy-first subscription tracker. No bank connection required.",
    creator: "@edvincodes",
  },

  icons: {
    icon: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground selection:bg-primary/20 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
