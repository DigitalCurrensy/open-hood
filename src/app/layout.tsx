import type { Metadata } from "next";
import { Barlow, Big_Shoulders_Stencil, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { BRAND } from "@/lib/brand";
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

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ticket focus:px-3 focus:py-2 focus:text-ticket-ink"
        >
          Skip to tools
        </a>
        <SiteNav />
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
