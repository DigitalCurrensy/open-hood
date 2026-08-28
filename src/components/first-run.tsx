"use client";

import { useEffect, useSyncExternalStore } from "react";
import { BayLink } from "@/components/bay-link";
import {
  completeFirstRun,
  readFirstRun,
  subscribeFirstRun,
  writeFirstRunStamp,
} from "@/lib/first-run";
import { DEMO_VIN, DEMO_VIN_LABEL } from "@/lib/seo";
import { useIdentifiedVehicle, useLastQuote } from "@/lib/vehicle-session";

export function FirstRunRail() {
  const [vehicle] = useIdentifiedVehicle();
  const [quote] = useLastQuote();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const state = useSyncExternalStore(subscribeFirstRun, readFirstRun, () => null);

  const vin = vehicle?.specs.vin ?? "";
  const hasQuote = Boolean(quote);

  useEffect(() => {
    if (!hydrated) return;
    if (vin) writeFirstRunStamp("identified");
    if (hasQuote) {
      writeFirstRunStamp("ticket");
      writeFirstRunStamp("sentence");
    }
    if (vin && hasQuote) completeFirstRun();
  }, [hydrated, vin, hasQuote]);

  if (!hydrated || state?.completedAt) return null;

  const identified = Boolean(state?.identified || vehicle);
  const ticket = Boolean(state?.ticket || quote);
  const sentence = Boolean(state?.sentence || quote);

  return (
    <section aria-label="First run on this device" className="rounded-sm border border-ticket/40 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">First run · this device</p>
      <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-fluorescent">Three stamps. No account.</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
        Identify the car, read the spec card, mark this ticket. Live bay is :3000. We will not leave you on leftover
        offline HTML.
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        <Stamp n="01" title="Identify" done={identified} href="/" hint={`Demo VIN · ${DEMO_VIN_LABEL}`} />
        <Stamp n="02" title="Spec sheet" done={identified} href="/garage" hint="Oil, PSI, the cap still wins" />
        <Stamp
          n="03"
          title="Mark this ticket"
          done={ticket && sentence}
          href="/quote"
          hint="Paste the RO. Leave with a sentence."
          onOpen={() => {
            writeFirstRunStamp("ticket");
            writeFirstRunStamp("sentence");
            if (vehicle) completeFirstRun();
          }}
        />
      </ol>
      {!vehicle ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
          Demo VIN {DEMO_VIN} · one tap on the empty bay
        </p>
      ) : null}
    </section>
  );
}

function Stamp({
  n,
  title,
  done,
  href,
  hint,
  onOpen,
}: {
  n: string;
  title: string;
  done: boolean;
  href: string;
  hint: string;
  onOpen?: () => void;
}) {
  return (
    <li>
      <BayLink
        href={href}
        onClick={() => onOpen?.()}
        className={`block min-h-11 rounded-sm border px-3 py-3 ${
          done ? "border-ticket/50 bg-ticket/10" : "border-white/15 bg-bay/50"
        }`}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
          {n}
          {done ? " · done" : ""}
        </span>
        <span className="mt-1 block font-display text-xl uppercase tracking-wide text-fluorescent">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-aluminum">{hint}</span>
      </BayLink>
    </li>
  );
}
