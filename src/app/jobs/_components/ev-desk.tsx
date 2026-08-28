"use client";

import { EV_CHECKS } from "@/lib/jobs/checklists";
import { CheckDesk } from "@/app/jobs/_components/check-desk";

export function EvDesk() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <h2 className="font-display text-2xl uppercase tracking-wide">Still service</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-aluminum">
            <li>12V battery — load test, age. This strands more EVs than the pack.</li>
            <li>Tires — rotate, door-sticker PSI, even wear from torque.</li>
            <li>Brake fluid — years. Pads may last; rust and glaze still happen.</li>
            <li>Cabin filter. Coolant loops with the right chemistry.</li>
          </ul>
        </article>
        <article className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Not on the menu</p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none">No oil change</h2>
          <p className="mt-3 text-sm leading-6">
            No spark plugs. No &quot;trans flush&quot; on a single-speed reduction gear unless the book lists a fluid.
            Decline the ICE lane. If they want inverter coolant, ask which loop and which jug.
          </p>
        </article>
      </div>
      <CheckDesk
        storageKey="openhood.jobs.ev"
        items={EV_CHECKS}
        readyLabel="You know what this car still needs"
        blockedLabel="Tick what still ages. The pack is not the 12V."
      />
    </div>
  );
}
