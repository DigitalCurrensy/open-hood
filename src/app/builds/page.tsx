import type { Metadata } from "next";
import { BuildsDesk } from "@/components/builds-desk";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Build log",
  description: "Track a kit, swap, or project: chassis + engine + transmission on one binder.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Enthusiast binder" title="Build log">
        When one VIN is a lie — kit car, engine swap, or a chassis that no longer matches the door sticker.
      </PageHeader>
      <BuildsDesk />
    </div>
  );
}
