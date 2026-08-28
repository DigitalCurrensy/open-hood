import { llmsTxt } from "@/lib/llms-txt";
import { siteUrl } from "@/lib/site-url";

export function GET() {
  return new Response(llmsTxt(siteUrl()), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
