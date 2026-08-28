import type { BayStatus, PipeState } from "@/app/integrations/bay-types";

const STATE_LABEL: Record<PipeState, string> = {
  live: "Live",
  outbound: "Outbound",
  dark: "Dark",
  refused: "Refused",
};

export function MatrixBoard({ status }: { status: BayStatus | null }) {
  if (!status) {
    return (
      <section className="int-punch rounded-sm border border-white/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Status matrix</p>
        <p className="mt-2 text-sm text-aluminum">Walking the public lines…</p>
      </section>
    );
  }

  const counts = {
    live: status.pipes.filter((row) => row.state === "live").length,
    outbound: status.pipes.filter((row) => row.state === "outbound").length,
    dark: status.pipes.filter((row) => row.state === "dark").length,
    refused: status.pipes.filter((row) => row.state === "refused").length,
  };

  return (
    <section className="int-punch space-y-4 rounded-sm border border-white/10 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Status matrix · {status.count} jacks</p>
          <p className="mt-1 text-sm leading-6 text-aluminum">
            Live probes hit public APIs. Weekend keys stay{" "}
            <span className="font-mono text-fluorescent">configured:false</span> until they are actually on — then{" "}
            <span className="font-mono text-fluorescent">probed:skip</span>. Stripe test is packet Checkout. Live
            without a Price ID is detected, escrow refused.
          </p>
        </div>
        <ul className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">
          <li>{counts.live} live</li>
          <li>{counts.outbound} outbound</li>
          <li>{counts.dark} dark</li>
          <li className="text-cone">{counts.refused} refused</li>
        </ul>
      </div>

      {status.probes.length ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {status.probes.map((probe) => (
            <li key={probe.id} className="rounded-sm border border-white/10 bg-bay/50 px-3 py-2">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cone">
                <span className="int-led" data-state={probe.id.includes("recallsByVin") ? "refused" : probe.ok ? "live" : "dark"} />
                {probe.label}
                <span className="ml-auto text-aluminum-dim">{probe.ms}ms</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-fluorescent">
                {probe.status != null ? `HTTP ${probe.status}. ` : ""}
                {probe.note}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="max-h-[28rem] overflow-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-[0.2em] text-cone">
              <th className="border-b border-white/10 py-2 pr-3 font-normal">Jack</th>
              <th className="border-b border-white/10 py-2 pr-3 font-normal">State</th>
              <th className="border-b border-white/10 py-2 pr-3 font-normal">Configured</th>
              <th className="border-b border-white/10 py-2 pr-3 font-normal">Probed</th>
              <th className="border-b border-white/10 py-2 font-normal">Unlocks / honesty</th>
            </tr>
          </thead>
          <tbody>
            {status.pipes.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="border-b border-white/5 py-2 pr-3">
                  <span className="font-display text-lg uppercase leading-none text-fluorescent">{row.stamp}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-aluminum">{row.name}</span>
                </td>
                <td className="border-b border-white/5 py-2 pr-3">
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                    <span className="int-led" data-state={row.state} />
                    {STATE_LABEL[row.state]}
                  </span>
                </td>
                <td className="border-b border-white/5 py-2 pr-3 font-mono text-xs text-aluminum">
                  {row.configured === null ? "—" : row.configured ? "true" : "false"}
                </td>
                <td className="border-b border-white/5 py-2 pr-3 font-mono text-xs text-aluminum">
                  {row.probed ?? "—"}
                </td>
                <td className="border-b border-white/5 py-2 text-xs leading-5 text-aluminum">{row.unlocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-5 text-aluminum">
        Stripe: <span className="text-fluorescent">{status.stripe.kind}</span>
        {status.stripe.liveKeyDetected ? " · live key detected" : ""}
        {status.stripe.configured ? " · configured:true" : " · configured:false"}
        {status.stripe.refused ? " · charges refused" : ""}
        {` · product:${status.stripe.product} · checkout:${String(status.stripe.checkout)} · escrow:false. `}
        {status.stripe.notice}
      </p>
    </section>
  );
}
