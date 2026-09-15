import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  serverExternalPackages: ["tesseract.js"],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async redirects() {
    return [
      { source: "/obd/:code", destination: "/obd?code=:code", permanent: false },
      { source: "/ai.txt", destination: "/llms.txt", permanent: true },
      { source: "/gpt.txt", destination: "/llms.txt", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/:file(llms.txt|humans.txt|security.txt|pricing.md)",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
      {
        source: "/.well-known/:file(llms.txt|security.txt)",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
      {
        source: "/offline",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        source: "/og.png",
        headers: [
          { key: "Content-Type", value: "image/png" },
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
