import type { Metadata } from "next";
import { BrandTicket } from "@/app/_components/brand-ticket";
import { HomeCite } from "@/app/_components/home-cite";
import { AskStage } from "@/components/agent/ask-stage";
import { GarageBay } from "@/components/garage-bay";
import { JsonLd } from "@/components/json-ld";
import { BRAND } from "@/lib/brand";
import { howToJsonLd, pageMeta, speakableWebPageJsonLd } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ vin?: string }>;
}): Promise<Metadata> {
  const { vin } = await searchParams;
  return pageMeta({
    title: `${BRAND.short} — ${BRAND.tagline}`,
    description: BRAND.description,
    path: "/",
    index: !vin,
    absolute: true,
  });
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ vin?: string }>;
}) {
  const { vin } = await searchParams;
  return (
    <div className="space-y-6">
      <JsonLd data={speakableWebPageJsonLd("/", ["[data-speakable]", "h1", "#ask"])} />
      <JsonLd
        data={howToJsonLd({
          name: "Use Open Hood at the service window",
          description: "Identify the car, mark the ticket, say three sentences.",
          path: "/",
          steps: [
            "Load the VIN or year / make / model.",
            "Paste the estimate or ask about a line such as a $89 cabin filter.",
            "Copy the three sentences and say them at the window.",
          ],
        })}
      />
      <BrandTicket />
      <AskStage />
      <GarageBay initialVin={vin ?? ""} />
      <HomeCite />
    </div>
  );
}
