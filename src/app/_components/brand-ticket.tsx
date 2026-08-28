import { BRAND } from "@/lib/brand";

/** On-site NCR lockup — same copy as /og.png for browser and phone share previews. */
export function BrandTicket() {
  return (
    <aside aria-label={`${BRAND.short} ticket`} className="overflow-hidden rounded-sm border border-white/10 bg-bay-2">
      <div className="px-5 py-6 sm:px-8">
        <p className="font-display text-5xl uppercase leading-none tracking-wide text-fluorescent sm:text-7xl">
          {BRAND.short}
        </p>
        <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-cone">{BRAND.kicker}</p>
        <div className="ticket-paper relative mt-5 flex items-center gap-3 rounded-sm px-3 py-4 text-ticket-ink sm:gap-5 sm:px-5">
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] opacity-55 sm:inline" style={{ writingMode: "vertical-rl" }}>
            001401
          </span>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-display text-xl uppercase leading-none tracking-wide sm:text-3xl">VIN → spec card → marked-up RO</p>
            <span className="mt-3 block h-[3px] w-full bg-grease" aria-hidden />
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] opacity-55 sm:inline" style={{ writingMode: "vertical-rl" }}>
            NCR
          </span>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">{BRAND.shareText}</p>
      </div>
    </aside>
  );
}
