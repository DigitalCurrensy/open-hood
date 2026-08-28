import { absoluteUrl, siteUrl } from "@/lib/site-url";

export function securityTxt(base = siteUrl()): string {
  return [
    `Contact: ${absoluteUrl("/contact")}`,
    "Expires: 2027-08-25T00:00:00.000Z",
    "Preferred-Languages: en",
    `Canonical: ${base}/.well-known/security.txt`,
    `Policy: ${absoluteUrl("/privacy")}`,
    "",
  ].join("\n");
}

export function GET() {
  return new Response(securityTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
