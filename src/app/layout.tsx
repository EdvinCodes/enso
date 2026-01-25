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

// 1. Viewport Config (Importante para móviles)
export const viewport: Viewport = {
  themeColor: "#09090b", // Coincide con tu bg-zinc-950
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
  authors: [{ name: "EdvinCodes" }], // Tu nombre aquí
  creator: "EdvinCodes",

  // Open Graph (Para compartir en redes)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://enso.vercel.app", // Tu futura URL
    title: "ENSO | Control Your Recurring Expenses",
    description:
      "Privacy-first subscription tracker. No bank connection required.",
    siteName: "ENSO",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "ENSO | Subscription Intelligence",
    description:
      "Privacy-first subscription tracker. No bank connection required.",
    creator: "@edvincodes", // Tu usuario si tienes
  },

  icons: {
    icon: "/icon", // Apunta al archivo icon.tsx que creamos
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Forzamos modo oscuro para mantener la estética 'Midnight Glass'
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground selection:bg-primary/20 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
