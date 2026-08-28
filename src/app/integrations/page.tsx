import type { Metadata } from "next";
import { IntegrationsBay } from "@/app/integrations/integrations-bay";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";
import type { IntegrationContext } from "@/lib/integrations/types";
import "./integrations.css";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "The patch bay: NHTSA, EPA, maps, parts counters, auctions, and honest paid hooks. Every Open button goes somewhere real.",
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const initial: IntegrationContext = {
    year: first(params.year),
    make: first(params.make),
    model: first(params.model),
    vin: first(params.vin),
    address: first(params.address) || first(params.q) || first(params.zip),
    part: first(params.part),
    howTo: first(params.howTo) || first(params.job),
  };

  return (
    <div className="space-y-6">
      <PageBrief href="/integrations" />
      <PageHeader kicker="Patch bay · no fake keys" title="Integrations">
        Public lines get a live probe. Weekend keys stay configured:false until they are actually on — then
        probed:skip. Stripe test opens packet Checkout. Live needs a Price ID we already have. Escrow refused. TecDoc /
        MOTOR / PartsTech stay an empty bay — ROADMAP, not fake SKUs. OSM remains the shop map.
      </PageHeader>
      <IntegrationsBay
        initial={initial}
        packetReturn={first(params.packet)}
        sessionId={first(params.session_id)}
      />
    </div>
  );
}
