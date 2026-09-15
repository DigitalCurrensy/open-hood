import type { Metadata, Viewport } from "next";
import { Barlow, Big_Shoulders_Stencil, IBM_Plex_Mono } from "next/font/google";
import { AskDock } from "@/components/agent/ask-dock";
import { Ga4 } from "@/components/ga4";
import { JsonLd } from "@/components/json-ld";
import { PwaBoot } from "@/components/pwa-boot";
import { PwaUnlockScript } from "@/components/pwa-unlock-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { BRAND } from "@/lib/brand";
import { OG_IMAGE, SEO_KEYWORDS, siteGraphJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Big_Shoulders_Stencil({
  variable: "--font-shoulders",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const sans = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c1210",
};

const googleVerify = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.short} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.short}`,
  },
  description: BRAND.description,
  keywords: [...SEO_KEYWORDS],
  applicationName: BRAND.short,
  authors: [{ name: BRAND.short, url: siteUrl() }],
  creator: BRAND.short,
  category: "automotive",
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BRAND.short,
    title: `${BRAND.short} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [{ ...OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.short} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [{ ...OG_IMAGE }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.short,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": BRAND.short,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.png"],
  },
  ...(googleVerify ? { verification: { google: googleVerify } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <head>
        <PwaUnlockScript />
      </head>
      <body className="flex min-h-full flex-col">
        <JsonLd data={siteGraphJsonLd()} />
        <Ga4 />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ticket focus:px-3 focus:py-2 focus:text-ticket-ink">
          Skip to tools
        </a>
        <PwaBoot />
        <SiteNav />
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 pb-28 sm:px-8 sm:py-8 sm:pb-28">
          {children}
        </main>
        <SiteFooter />
        <AskDock />
      </body>
    </html>
  );
}
