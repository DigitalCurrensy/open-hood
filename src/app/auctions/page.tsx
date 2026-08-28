import type { Metadata } from "next";
import { AuctionsDesk } from "@/app/auctions/auctions-desk";
import { PageBrief } from "@/components/page-brief";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Auctions",
  description:
    "Public consumer auctions versus Copart/IAA salvage lanes and dealer-only wholesale. Link-out search only.",
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
  return (
    <div className="space-y-6">
      <PageBrief href="/auctions" />
      <PageHeader kicker="Lanes · not a live board" title="Auctions">
        BaT and Cars & Bids are public consumer auctions. Copart and IAA show lots; bidding is usually a dealer or
        broker. Manheim and ADESA stay wholesale. We link out. We do not scrape.
      </PageHeader>
      <AuctionsDesk
        year={first(params.year)}
        make={first(params.make)}
        model={first(params.model)}
        q={first(params.q)}
      />
    </div>
  );
}
