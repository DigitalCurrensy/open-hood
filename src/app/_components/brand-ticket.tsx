import { BRAND } from "@/lib/brand";

export function BrandTicket() {
  return (
    <aside aria-label={`${BRAND.short} ticket`} className="rounded-sm border border-white/10 bg-bay-2 px-5 py-5 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">{BRAND.kicker}</p>
      <p className="mt-2 font-display text-4xl uppercase leading-none tracking-wide text-fluorescent sm:text-5xl">
        {BRAND.short}
      </p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-aluminum">{BRAND.oneLiner}</p>
    </aside>
  );
}
