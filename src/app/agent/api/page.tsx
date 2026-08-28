import { AgentApiSpec } from "@/components/agent/api-spec";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advocate API",
  description:
    "OpenAPI 3.1 for POST /api/agent, GET /api/agent status, and the bay tools the advocate uses. Not a booking API.",
};

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Window 02 · contract" title="Advocate API">
        Same tools the advocate desk runs. Native fetch examples on the contract. Integrations honesty lives on{" "}
        <Link href="/integrations" className="text-ticket">
          /integrations
        </Link>
        . We do not book a bay.
      </PageHeader>
      <p className="flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
        <Link href="/agent" className="hover:text-ticket">
          Back to the desk
        </Link>
        <Link href="/api/openapi" className="hover:text-ticket">
          GET /api/openapi
        </Link>
        <Link href="/openapi.yaml" className="hover:text-ticket">
          /openapi.yaml
        </Link>
        <Link href="/api/openapi?format=json" className="hover:text-ticket">
          JSON
        </Link>
      </p>
      <AgentApiSpec />
    </div>
  );
}
