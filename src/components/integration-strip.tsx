import { STRIP_IDS, actionFor, integrationById } from "@/lib/integrations/catalog";
import { EXTRA_STRIP_IDS, extraById } from "@/app/integrations/extra-pipes";
import type { IntegrationContext } from "@/lib/integrations/types";
import { EMPTY_CONTEXT } from "@/lib/integrations/types";

export function IntegrationStrip({
  year = "",
  make = "",
  model = "",
  vin = "",
  address = "",
  part = "",
  howTo = "",
  heading = "Patch lines",
}: Partial<IntegrationContext> & { heading?: string }) {
  const ctx: IntegrationContext = {
    ...EMPTY_CONTEXT,
    year,
    make,
    model,
    vin,
    address,
    part,
    howTo,
  };

  return (
    <aside className="no-print rounded-sm border border-white/10 bg-bay-2/70 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cone">{heading}</p>
      <p className="mt-1 text-sm leading-6 text-aluminum">
        Public desks. No fake inventory. Each stamp opens the real site.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {[...STRIP_IDS, ...EXTRA_STRIP_IDS].map((id) => {
          const def = integrationById(id) ?? extraById(id);
          if (!def) return null;
          const action = actionFor(def, ctx, {});
          return (
            <li key={id}>
              <a
                href={action.href}
                target={action.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="inline-block rounded-sm border border-white/15 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fluorescent hover:border-ticket/60 hover:text-ticket"
              >
                {def.stamp}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
