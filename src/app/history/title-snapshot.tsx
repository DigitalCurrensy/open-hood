"use client";

import { useEffect, useState } from "react";
import {
  autocheckPurchaseUrl,
  carfaxPurchaseUrl,
  nicbVincheckUrl,
  NMVTIS_CONSUMERS,
} from "@/lib/history/links";
import type { TitleSnapshot, TitleSnapshotStatus } from "@/lib/title-snapshot";

const TITLE_API = "/api/history/title";
const EXTERNAL = "noopener noreferrer";

export function TitleSnapshotBay({ vin }: { vin: string }) {
  const [status, setStatus] = useState<TitleSnapshotStatus | null>(null);
  const [snapshot, setSnapshot] = useState<TitleSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(TITLE_API, { cache: "no-store" })
      .then((res) => res.json())
      .then((body: TitleSnapshotStatus) => {
        if (!cancelled) setStatus(body);
      })
      .catch(() => {
        /* stamp still prints */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!vin || !status?.live) return;
    let cancelled = false;
    void fetch(TITLE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin }),
    })
      .then((res) => res.json())
      .then((body: TitleSnapshot) => {
        if (!cancelled) setSnapshot(body);
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot({
            ok: false,
            configured: Boolean(status.configured),
            connected: false,
            vendor: status.preferred,
            vendorLabel: "",
            vin,
            stamp: "Not a Carfax file. Not Consumer Reports.",
            notice: status.notice,
            year: "",
            make: "",
            model: "",
            brands: [],
            records: [],
            invented: false,
            error: "Title vendor did not answer.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [vin, status?.live, status?.configured, status?.preferred, status?.notice]);

  const live = Boolean(status?.live);
  const shown = live && vin && snapshot?.vin === vin ? snapshot : null;
  const waiting = live && Boolean(vin) && !shown;
  const brands = shown?.brands ?? [];
  const records = shown?.records ?? [];

  return (
    <section
      className={`history-paid rounded-sm border p-5 ${
        live ? "history-title-keyed border-ticket/30 bg-bay-2/80" : "history-title-dark border-white/10 bg-bay-2/80"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
        {live ? `Keyed · ${status?.preferred === "vinaudit" ? "VinAudit" : "CarsXE history"}` : "Dark · empty title bay"}
      </p>
      <h3 className="font-display text-2xl uppercase tracking-wide">Not a Carfax file</h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
        {live ? `Source · ${status?.preferred === "vinaudit" ? "VinAudit" : "CarsXE"}` : "Source · none"}
      </p>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        {status?.notice ??
          "Empty bay. Not a Carfax file. We will not invent accidents, salvage, or an owner count."}
      </p>
      {!live ? (
        <p className="mt-3 border-l-2 border-cone pl-3 text-sm leading-6 text-fluorescent">
          Empty bay. Not a Carfax file. We will not invent accidents. Buy a consumer report if you need wrecks or a
          title brand.
        </p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-aluminum">
          Named vendor only. Carfax / AutoCheck / NICB stay outbound. We still do not invent wrecks.
        </p>
      )}
      <TitleOutboundLinks vin={vin} />
      {live && !vin ? (
        <p className="mt-3 text-sm leading-6 text-aluminum">Decode a VIN first. Then this bay asks the vendor you paid.</p>
      ) : null}
      {waiting ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Asking the title vendor…</p>
      ) : null}
      {shown?.error ? <p className="mt-3 text-sm leading-6 text-cone">{shown.error}</p> : null}
      {shown?.vendorLabel ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
          Vendor · {shown.vendorLabel}
          {shown.year || shown.make || shown.model
            ? ` · ${[shown.year, shown.make, shown.model].filter(Boolean).join(" ")}`
            : ""}
        </p>
      ) : null}
      {brands.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {brands.map((row) => (
            <li
              key={row.id}
              className="rounded-sm border border-white/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fluorescent"
            >
              {row.label} · {row.reported ? "reported" : "not reported"}
            </li>
          ))}
        </ul>
      ) : live && vin && shown && shown.connected && !shown.error && !waiting ? (
        <p className="mt-3 text-sm leading-6 text-aluminum">
          Vendor answered. No brand flags in this payload. Still not a Carfax file.
        </p>
      ) : null}
      {records.length ? (
        <ol className="mt-4 space-y-2">
          {records.map((row, index) => (
            <li key={`${row.date}-${row.kind}-${index}`} className="text-sm leading-6 text-aluminum">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ticket">
                {row.date || "undated"}
                {row.kind ? ` · ${row.kind}` : ""}
              </span>
              {row.detail ? <span className="mt-0.5 block">{row.detail}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function TitleOutboundLinks({ vin }: { vin: string }) {
  const links = [
    carfaxPurchaseUrl(vin),
    autocheckPurchaseUrl(vin),
    nicbVincheckUrl(vin),
    {
      id: "nmvtis",
      stamp: "NMVTIS",
      label: "NMVTIS consumer page",
      href: NMVTIS_CONSUMERS,
    },
  ];
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel={EXTERNAL}
            className="inline-block rounded-sm border border-white/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ticket hover:border-ticket/50 hover:text-fluorescent"
          >
            {link.stamp}
          </a>
        </li>
      ))}
    </ul>
  );
}
