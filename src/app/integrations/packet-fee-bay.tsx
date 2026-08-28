"use client";

import { useEffect, useState } from "react";
import type { StripeRow } from "@/app/integrations/bay-types";

function returnCopy(packetReturn?: string, sessionId?: string): string {
  if (packetReturn === "cancel") return "Checkout cancelled. No packet fee. Escrow was never on the table.";
  if (packetReturn === "paid" && !sessionId) {
    return "Stripe sent you back. Confirm the payment on the Stripe test dashboard if the stamp is missing.";
  }
  return "";
}

export function PacketFeeBay({
  stripe,
  packetReturn,
  sessionId,
}: {
  stripe: StripeRow | null;
  packetReturn?: string;
  sessionId?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [fault, setFault] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const paidNote = sessionNote || returnCopy(packetReturn, sessionId);

  useEffect(() => {
    if (packetReturn !== "paid" || !sessionId) return;
    let cancelled = false;
    fetch(`/api/stripe/packet?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((body: { session?: { paymentStatus?: string }; error?: string }) => {
        if (cancelled) return;
        if (body.session?.paymentStatus === "paid") {
          setSessionNote("Test packet fee paid. Print packet / hold this bay. Not escrow. Not a shop cut.");
          return;
        }
        setSessionNote(body.error || "Stripe session is open or unpaid. No escrow was created.");
      })
      .catch(() => {
        if (!cancelled) setSessionNote("Could not read that Checkout session. Check the Stripe test dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, [packetReturn, sessionId]);

  async function startCheckout() {
    setBusy(true);
    setFault("");
    try {
      const response = await fetch("/api/stripe/packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: "/integrations" }),
      });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        setFault(body.error || "Stripe did not open Checkout. No money moved.");
        return;
      }
      window.location.href = body.url;
    } catch {
      setFault("The packet desk did not answer. No money moved.");
    } finally {
      setBusy(false);
    }
  }

  const ready = Boolean(stripe?.checkout);
  const kind = stripe?.kind ?? "none";

  return (
    <section className="ticket-paper print-ticket rounded-sm p-5 text-ticket-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em]">
        Packet fee · Stripe {kind}
        {stripe?.product === "packet" ? " · product:packet" : " · product:none"}
      </p>
      <h2 className="mt-1 font-display text-3xl uppercase leading-none">Print packet / hold this bay</h2>
      <p className="mt-3 text-sm leading-6">
        {stripe?.notice ??
          "Optional bay fee. A sk_test_ key opens Stripe Checkout. A live key needs a Price ID we already have. Escrow, shop cuts, and marketplace stay refused."}
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em]">
        escrow:false · shopCuts:false · marketplace:false · checkout:{String(Boolean(stripe?.checkout))}
      </p>
      {paidNote ? <p className="mt-3 text-sm leading-6">{paidNote}</p> : null}
      {fault ? (
        <p role="alert" className="mt-3 text-sm leading-6">
          {fault}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {ready ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void startCheckout()}
            className="rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
          >
            {busy ? "Opening Stripe…" : kind === "live" ? "Pay packet fee" : "Pay test packet fee"}
          </button>
        ) : (
          <a
            href="https://dashboard.stripe.com/apikeys"
            rel="noreferrer"
            className="rounded-sm border border-black/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em]"
          >
            {kind === "live" ? "Need a Price ID first" : "Paste a sk_test_ key"}
          </a>
        )}
        <a
          href="/report"
          className="rounded-sm border border-black/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em]"
        >
          Print packet (free)
        </a>
      </div>
    </section>
  );
}
