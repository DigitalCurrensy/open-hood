"use client";

import { CompareTicket } from "@/app/book/_components/compare-ticket";
import { DealerDesk } from "@/app/book/_components/dealer-desk";
import { ShopShortlistPanel } from "@/app/book/_components/shop-shortlist";
import { StatusBoard } from "@/app/book/_components/status-board";
import { VendorBay } from "@/app/book/_components/vendor-bay";
import { VisitForm } from "@/app/book/_components/visit-form";
import { useReadingLevel } from "@/components/reading-level";
import { BOOK_API_PATH } from "@/config/nav/book";
import { dealerAppointmentLinks } from "@/lib/book/dealers";
import { fetchShopShortlist, type ShopShortlist, type ShortlistFilter } from "@/lib/book/directory";
import { useBookBoard } from "@/lib/book/status";
import type { BookDraft, BookMailerStatus, BookSubmitResult } from "@/lib/book/types";
import { emptyBookDraft } from "@/lib/book/validate";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import "./book.css";

export function BookDesk() {
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const [vehicle] = useIdentifiedVehicle();
  const { rows, remember, forget, clear } = useBookBoard();
  const [edits, setEdits] = useState<BookDraft>(() => emptyBookDraft());
  const [fault, setFault] = useState("");
  const [fieldFaults, setFieldFaults] = useState<Partial<Record<keyof BookDraft, string>>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BookSubmitResult | null>(null);
  const [mailer, setMailer] = useState<BookMailerStatus | null>(null);
  const [fetched, setFetched] = useState<{
    zip: string;
    filter: ShortlistFilter;
    data: ShopShortlist;
  } | null>(null);
  const [shortlistBusy, setShortlistBusy] = useState(false);

  const draft: BookDraft = {
    ...edits,
    vin: edits.vin || vehicle?.specs.vin || "",
    year: edits.year || vehicle?.specs.year || "",
    make: edits.make || vehicle?.specs.make || "",
    model: edits.model || vehicle?.specs.model || "",
    mileage: edits.mileage || vehicle?.specs.mileage || "",
  };

  useEffect(() => {
    let cancelled = false;
    void fetch(BOOK_API_PATH, { cache: "no-store" })
      .then((response) => response.json())
      .then((body: BookMailerStatus & { ok?: boolean }) => {
        if (!cancelled && (body.delivery === "email" || body.delivery === "local")) {
          setMailer({
            delivery: body.delivery,
            mailer: body.mailer,
            toConfigured: body.toConfigured,
            dispatched: false,
          });
        }
      })
      .catch(() => {
        /* POST still tells the truth */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const zip = draft.zip.trim();
  const filter: ShortlistFilter = draft.venue === "dealer" ? "dealers" : "repair";
  const zipReady = /^\d{5}$/.test(zip);
  const shortlist: ShopShortlist =
    zipReady && fetched && fetched.zip === zip && fetched.filter === filter ? fetched.data : { kind: "idle" };

  useEffect(() => {
    if (!zipReady) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      setShortlistBusy(true);
      void fetchShopShortlist(zip, filter)
        .then((next) => {
          if (!cancelled) setFetched({ zip, filter, data: next });
        })
        .finally(() => {
          if (!cancelled) setShortlistBusy(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [zip, filter, zipReady]);

  const dealerLinks = dealerAppointmentLinks(draft.make, zip);

  const mailerHint =
    mailer?.delivery === "email"
      ? "This bay has a mailer. The request goes to the desk — not a van."
      : "No mailer on this bay — Send stamps .data/book-requests.jsonl. We will not say it emailed a team.";

  function patch<K extends keyof BookDraft>(key: K, value: BookDraft[K]) {
    setEdits((current) => ({ ...current, [key]: value }));
    if (fault) setFault("");
    if (fieldFaults[key]) {
      setFieldFaults((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  async function onSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFault("");
    setFieldFaults({});
    try {
      const response = await fetch(BOOK_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = (await response.json()) as
        | BookSubmitResult
        | { ok: false; error?: string; fields?: typeof fieldFaults };
      if (!response.ok || !("ok" in body) || body.ok !== true) {
        const err = body as { error?: string; fields?: typeof fieldFaults };
        setFieldFaults(err.fields ?? {});
        setFault(err.error || "Could not stamp that visit request.");
        return;
      }
      remember(body, draft);
      setResult(body);
    } catch {
      setFault("The intake desk did not answer. Check the line and send the request again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <CompareTicket />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {result ? (
          <SuccessTicket result={result} onAnother={() => setResult(null)} />
        ) : (
          <VisitForm
            draft={draft}
            expert={expert}
            busy={busy}
            fault={fault}
            fieldFaults={fieldFaults}
            mailerHint={mailerHint}
            onPatch={patch}
            onSubmit={onSend}
          />
        )}
        <StatusBoard rows={rows} onForget={forget} onClear={clear} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ShopShortlistPanel zip={zip} shortlist={shortlist} busy={shortlistBusy} />
        <DealerDesk make={draft.make} zip={zip} links={dealerLinks} />
      </div>

      <VendorBay />
    </div>
  );
}

function SuccessTicket({ result, onAnother }: { result: BookSubmitResult; onAnother: () => void }) {
  const local = result.delivery === "local";

  return (
    <div className="space-y-4">
      <article className="book-success book-void ticket-paper print-ticket rounded-sm p-6 text-ticket-ink">
        <p className="book-void-stamp">Not dispatched</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">{local ? "Local stamp" : "Desk copy"}</p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-none">Request stored</h2>
        <p className="mt-3 text-sm leading-6">{result.notice}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          Stored {result.stored} · dispatched {String(result.dispatched)}
        </p>
        <div className="book-perforation my-4 opacity-50" />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]">{result.summary.title}</p>
        <pre className="mt-3 overflow-x-auto font-mono text-xs leading-6 whitespace-pre-wrap">{result.summary.text}</pre>
      </article>

      <div className="no-print flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Print this copy
        </button>
        <button
          type="button"
          onClick={onAnother}
          className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
        >
          Another visit note
        </button>
        <Link
          href={result.directoryHref}
          className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
        >
          Directory
        </Link>
      </div>

      <nav aria-label="Next desks" className="no-print rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Still in the bay</p>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          The request is stored. Nobody is rolling. Quote, directory, and the RO window stay open.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {result.nextDesks.map((desk) => (
            <li key={desk.href}>
              <Link
                href={desk.href}
                className="inline-block rounded-sm border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              >
                {desk.stamp}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
