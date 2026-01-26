import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  // Base URL es vital para que las rutas de imágenes funcionen en producción
  metadataBase: new URL("https://enso-three.vercel.app"),

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
    "Next.js 16",
    "Supabase",
  ],
  authors: [{ name: "EdvinCodes" }],
  creator: "EdvinCodes",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://enso-three.vercel.app",
    title: "ENSO | Control Your Recurring Expenses",
    description:
      "Secure subscription tracker with Cloud Sync. No more forgotten payments.",
    siteName: "ENSO",
    images: [
      {
        url: "/preview.webp", // <--- ASEGÚRATE QUE EL NOMBRE COINCIDA CON EL ARCHIVO EN /public
        width: 1200,
        height: 630,
        alt: "ENSO Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ENSO | Subscription Intelligence",
    description: "Secure subscription tracker with Cloud Sync.",
    images: ["/preview.webp"], // <--- MISMO AQUÍ
    creator: "@edvincodes",
  },

  // Al tener icon.tsx, NO definimos 'icon' manualmente aquí.
  // Next.js detectará el archivo icon.tsx automáticamente.
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
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
