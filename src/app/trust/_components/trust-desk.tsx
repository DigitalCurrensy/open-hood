"use client";

import { MediaCapture, type CompressedImage } from "@/components/media-capture";
import { useReadingLevel } from "@/components/reading-level";
import {
  AAA_APPROVED_SHOP,
  BONDED_ESTIMATE_CHECKS,
  EXTERNAL_REL,
  FNOL_CARRIERS,
  FNOL_SHOTS,
  TRUST_CHECKLIST_STORAGE_KEY,
  TRUST_FNOL_STORAGE_KEY,
  TRUST_HOLD_API_PATH,
  TRUST_NEXT_DESKS,
  TRUST_WORK_STORAGE_KEY,
  WORK_VERIFY_SHOTS,
  type HoldStatus,
  type HoldTicket,
} from "@/lib/trust";
import { BayLink } from "@/components/bay-link";
import { useState, type FormEvent } from "react";
import { useFlagMap } from "@/app/trust/_components/use-flag-map";
import "../trust.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

export function TrustDesk({ initialHold }: { initialHold: HoldStatus }) {
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const checklist = useFlagMap(TRUST_CHECKLIST_STORAGE_KEY);
  const fnol = useFlagMap(TRUST_FNOL_STORAGE_KEY);
  const workTicks = useFlagMap(TRUST_WORK_STORAGE_KEY);
  const [workPhotos, setWorkPhotos] = useState<Record<string, CompressedImage | null>>({});
  const [activeShot, setActiveShot] = useState(WORK_VERIFY_SHOTS[0]?.id ?? "w1");
  const [amount, setAmount] = useState("50");
  const [hold, setHold] = useState<HoldStatus>(initialHold);
  const [ticket, setTicket] = useState<HoldTicket | null>(null);
  const [busy, setBusy] = useState(false);
  const [fault, setFault] = useState("");

  const holdIsTest = hold.mode === "stripe-test";
  const nextWork = WORK_VERIFY_SHOTS.find((shot) => !workTicks.flags[shot.id] && !workPhotos[shot.id]);

  async function onHold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFault("");
    try {
      const response = await fetch(TRUST_HOLD_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountDollars: amount }),
      });
      const body = (await response.json()) as HoldTicket | { ok: false; error?: string };
      if (!response.ok || !("ok" in body) || body.ok !== true) {
        setFault(("error" in body && body.error) || "Could not stamp that hold. No money moved.");
        return;
      }
      setTicket(body);
      const status = await fetch(TRUST_HOLD_API_PATH, { cache: "no-store" }).then((res) => res.json());
      if (status?.ok) setHold(status as HoldStatus);
    } catch {
      setFault("The hold window did not answer. No money moved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <section id="checklist" className="trust-carbon rounded-sm border border-white/10 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
            {expert ? "Written estimate · license · ceiling" : "Written estimate checklist"}
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">Before you authorize</h2>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {expert
              ? "This is not a surety bond we hold. Tick what is already on their paper. A blank license line is a question, not a vibe."
              : "A bonded-looking estimate is paper you can read. We do not bond the shop. We do not pay them."}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
            {checklist.count} / {BONDED_ESTIMATE_CHECKS.length} ticked
          </p>
          <ol className="mt-3 space-y-2">
            {BONDED_ESTIMATE_CHECKS.map((item) => {
              const checked = Boolean(checklist.flags[item.id]);
              return (
                <li key={item.id}>
                  <label className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-bay/60 p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => checklist.toggle(item.id)}
                      className="mt-1 size-4 shrink-0 accent-[var(--ticket)]"
                    />
                    <span>
                      <span className={`block font-display text-xl uppercase tracking-wide ${checked ? "text-aluminum line-through" : "text-fluorescent"}`}>
                        {item.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-aluminum">
                        {expert && item.expert ? item.expert : item.detail}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </section>

        <aside id="hold" className="space-y-4">
          <article
            className={`ticket-paper rounded-sm p-5 text-ticket-ink ${holdIsTest ? "trust-hold-test" : "trust-hold-demo"}`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
              {holdIsTest ? "Stripe test · not captured" : "DEMO hold · no money"}
            </p>
            <h2 className="mt-1 font-display text-3xl uppercase leading-none">
              {ticket ? ticket.amountLabel : hold.documentedAmountLabel}
            </h2>
            <p className="mt-3 text-sm leading-6">{hold.notice}</p>
            <div className="trust-perforation my-3 opacity-40" />
            <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
              Live charges: never on this desk · Capture: never here
            </p>
            {ticket ? (
              <p className="mt-3 font-mono text-xs leading-6">
                Stamp {ticket.id}
                {ticket.stripeStatus ? ` · ${ticket.stripeStatus}` : ""}
                <span className="mt-1 block">{ticket.notice}</span>
              </p>
            ) : null}
          </article>

          <form className="rounded-sm border border-white/10 bg-bay-2/80 p-5" onSubmit={onHold}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Documented amount</p>
            <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">
              {holdIsTest ? "Create a test PaymentIntent" : "Stamp a DEMO hold"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-aluminum">
              Default {hold.documentedAmountLabel}. Range {hold.minAmountLabel}–{hold.maxAmountLabel}. Not a shop
              deposit. Not escrow.
            </p>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">Hold dollars</span>
              <input
                name="amountDollars"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className={FIELD}
              />
            </label>
            {fault ? (
              <p role="alert" className="mt-3 text-sm leading-6 text-cone">
                {fault}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="mt-4 rounded-sm bg-ticket px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
            >
              {busy
                ? "Stamping…"
                : holdIsTest
                  ? "Create Stripe test PaymentIntent"
                  : "Stamp a DEMO hold"}
            </button>
          </form>
        </aside>
      </div>

      <section id="work-photos" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Photo verification</p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">Finished work</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-aluminum">
          {nextWork
            ? `Next frame: ${nextWork.title}. ${nextWork.frame} Photos compress on this phone. They stay here — we do not send them to a shop.`
            : "Folder has a frame for each line. Print the list if you want it on paper."}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <ol className="space-y-2">
            {WORK_VERIFY_SHOTS.map((shot) => {
              const done = Boolean(workTicks.flags[shot.id] || workPhotos[shot.id]);
              const current = activeShot === shot.id;
              return (
                <li key={shot.id}>
                  <button
                    type="button"
                    onClick={() => setActiveShot(shot.id)}
                    className={`w-full rounded-sm border px-4 py-3 text-left ${
                      current ? "border-ticket bg-ticket/10" : "border-white/10 bg-bay/40"
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
                      Shot {String(shot.order).padStart(2, "0")}
                      {done ? " · in folder" : ""}
                    </span>
                    <span className="mt-1 block font-display text-xl uppercase tracking-wide text-fluorescent">
                      {shot.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-aluminum">{shot.why}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <WorkShotCapture
            shotId={activeShot}
            image={workPhotos[activeShot] ?? null}
            onReady={(image) => {
              setWorkPhotos((current) => ({ ...current, [activeShot]: image }));
              workTicks.mark(activeShot, true);
            }}
            onClear={() => {
              setWorkPhotos((current) => ({ ...current, [activeShot]: null }));
              workTicks.mark(activeShot, false);
            }}
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <section id="fnol" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">First notice of loss</p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">Claim photo list</h2>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            {expert
              ? "Wide, medium, close with a coin. Prior damage gets its own frame. We do not file FNOL. Open the carrier."
              : "Shoot these, then open your carrier. We do not file the claim."}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
            {fnol.count} / {FNOL_SHOTS.length} in the folder
          </p>
          <ol className="mt-3 space-y-2">
            {FNOL_SHOTS.map((shot) => {
              const checked = Boolean(fnol.flags[shot.id]);
              return (
                <li key={shot.id}>
                  <label className="flex cursor-pointer gap-3 rounded-sm border border-white/10 bg-bay/60 p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => fnol.toggle(shot.id)}
                      className="mt-1 size-4 shrink-0 accent-[var(--ticket)]"
                    />
                    <span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
                        Shot {String(shot.order).padStart(2, "0")}
                      </span>
                      <span className={`block font-display text-xl uppercase tracking-wide ${checked ? "text-aluminum line-through" : "text-fluorescent"}`}>
                        {shot.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-aluminum">{shot.why}</span>
                      <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.12em] text-aluminum">
                        {shot.frame}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="space-y-4">
          <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Carrier desks</p>
            <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">File on their site</h3>
            <ul className="mt-3 space-y-2">
              {FNOL_CARRIERS.map((carrier) => (
                <li key={carrier.id}>
                  <a
                    href={carrier.href}
                    rel={EXTERNAL_REL}
                    target="_blank"
                    className="block rounded-sm border border-white/10 px-3 py-3 hover:border-ticket/50"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">{carrier.stamp}</span>
                    <span className="mt-1 block font-display text-xl uppercase text-fluorescent">{carrier.name}</span>
                    <span className="mt-1 block text-sm leading-6 text-aluminum">{carrier.blurb}</span>
                    <span className="mt-1 block font-mono text-[11px] text-aluminum">{carrier.phone}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section id="aaa" className="ticket-paper rounded-sm p-5 text-ticket-ink">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">{AAA_APPROVED_SHOP.stamp} locator</p>
            <h3 className="mt-1 font-display text-3xl uppercase leading-none">{AAA_APPROVED_SHOP.name}</h3>
            <p className="mt-3 text-sm leading-6">{AAA_APPROVED_SHOP.blurb}</p>
            <a
              href={AAA_APPROVED_SHOP.href}
              rel={EXTERNAL_REL}
              target="_blank"
              className="mt-4 inline-block rounded-sm bg-bay px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-fluorescent"
            >
              Open AAA approved shops
            </a>
          </section>
        </aside>
      </div>

      <nav aria-label="Next desks" className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Still in the bay</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {TRUST_NEXT_DESKS.map((desk) => (
            <li key={desk.href}>
              <BayLink
                href={desk.href}
                className="inline-block rounded-sm border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              >
                {desk.stamp}
              </BayLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function WorkShotCapture({
  shotId,
  image,
  onReady,
  onClear,
}: {
  shotId: string;
  image: CompressedImage | null;
  onReady: (image: CompressedImage) => void;
  onClear: () => void;
}) {
  const shot = WORK_VERIFY_SHOTS.find((row) => row.id === shotId);
  if (!shot) return null;
  return (
    <MediaCapture
      key={shot.id}
      label={shot.title}
      hint={`${shot.frame} JPEG on this phone.`}
      alt={shot.title}
      image={image}
      onReady={onReady}
      onClear={onClear}
    />
  );
}
