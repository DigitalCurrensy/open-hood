"use client";

import { useEffect, useMemo, useState } from "react";
import { FAMILY_LABEL, actionFor } from "@/lib/integrations/catalog";
import type {
  IntegrationContext,
  IntegrationDef,
  IntegrationFamily,
  IntegrationLane,
} from "@/lib/integrations/types";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import type { BayStatus } from "@/app/integrations/bay-types";
import { ALL_BAY_PIPES } from "@/app/integrations/extra-pipes";
import { FounderBay } from "@/app/integrations/founder-bay";
import { LicensedEmpty } from "@/app/integrations/licensed-empty";
import { MatrixBoard } from "@/app/integrations/matrix-board";
import { PacketFeeBay } from "@/app/integrations/packet-fee-bay";
import { ShareBay } from "@/app/integrations/share-bay";
import { IntegrationStrip } from "@/components/integration-strip";

type Filter = "all" | IntegrationLane | IntegrationFamily;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All jacks" },
  { id: "live", label: "Live" },
  { id: "env", label: "Keys" },
  { id: "catalog", label: "Request" },
  { id: "safety", label: "Safety" },
  { id: "fuel", label: "Fuel" },
  { id: "maps", label: "Maps" },
  { id: "parts", label: "Parts" },
  { id: "shops", label: "Shops" },
  { id: "auctions", label: "Lanes" },
  { id: "video", label: "How-to" },
  { id: "history", label: "History" },
  { id: "licensed", label: "Licensed" },
];

export function IntegrationsBay({
  initial,
  packetReturn,
  sessionId,
}: {
  initial: IntegrationContext;
  packetReturn?: string;
  sessionId?: string;
}) {
  const [vehicle] = useIdentifiedVehicle();
  const [draft, setDraft] = useState<IntegrationContext>(initial);
  const ctx: IntegrationContext = {
    year: draft.year || vehicle?.specs.year || "",
    make: draft.make || vehicle?.specs.make || "",
    model: draft.model || vehicle?.specs.model || "",
    vin: draft.vin || vehicle?.specs.vin || "",
    address: draft.address,
    part: draft.part,
    howTo: draft.howTo,
  };
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<BayStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/status")
      .then((res) => res.json())
      .then((body: BayStatus) => {
        if (!cancelled && Array.isArray(body.keys) && Array.isArray(body.pipes)) setStatus(body);
      })
      .catch(() => {
        /* status is decorative — cards still open real URLs */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const configured = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const key of status?.keys ?? []) map[key.env] = key.configured;
    for (const key of status?.paper ?? []) map[key.env] = false;
    return map;
  }, [status]);

  const visible = ALL_BAY_PIPES.filter((item) => {
    if (filter === "all") return true;
    if (filter === "live" || filter === "env" || filter === "catalog") return item.lane === filter;
    return item.family === filter;
  });

  function patch(field: keyof IntegrationContext, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <IntegrationStrip {...ctx} heading="Hot lines on this desk" />
        <ShareBay />
      </div>

      <section className="ticket-paper print-ticket rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Context ticket · feeds every jack</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="VIN" value={ctx.vin} onChange={(value) => patch("vin", value.toUpperCase())} placeholder="1HGCM82633A004352" />
          <Field label="Year" value={ctx.year} onChange={(value) => patch("year", value)} placeholder="2018" />
          <Field label="Make" value={ctx.make} onChange={(value) => patch("make", value)} placeholder="Honda" />
          <Field label="Model" value={ctx.model} onChange={(value) => patch("model", value)} placeholder="Civic" />
          <Field label="Address / ZIP" value={ctx.address} onChange={(value) => patch("address", value)} placeholder="97214" />
          <Field label="Part" value={ctx.part} onChange={(value) => patch("part", value)} placeholder="cabin filter" />
          <Field
            label="How-to job"
            value={ctx.howTo}
            onChange={(value) => patch("howTo", value)}
            placeholder="replace cabin filter"
            className="sm:col-span-2"
          />
        </div>
        <p className="mt-3 text-sm leading-6">
          Empty fields still open the official home page. Fill the ticket and every Open button carries the same car.
        </p>
      </section>

      <div className="no-print flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
              filter === item.id
                ? "bg-ticket text-ticket-ink"
                : "border border-white/10 text-aluminum hover:border-ticket/50 hover:text-fluorescent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <MatrixBoard status={status} />

      {status?.keys.length ? (
        <ul className="no-print grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {status.keys.map((key) => (
            <li
              key={key.env}
              className={`rounded-sm border px-3 py-2 ${
                key.refused
                  ? "border-grease/50 bg-grease/10"
                  : key.configured
                    ? "border-fair/50 bg-fair/10"
                    : "border-white/10 bg-bay-2/60"
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cone">
                {key.refused ? "Refused" : key.configured ? "Connected" : "No key"}
                {" · configured:"}
                {String(key.configured)}
                {" · probed:"}
                {key.probed}
              </p>
              <p className="font-display text-xl uppercase leading-none text-fluorescent">{key.label}</p>
              <p className="mt-1 text-xs leading-5 text-aluminum">{key.unlocks}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {status?.founder?.length ? <FounderBay rows={status.founder} /> : null}

      <PacketFeeBay stripe={status?.stripe ?? null} packetReturn={packetReturn} sessionId={sessionId} />

      <LicensedEmpty catalog={status?.licensedCatalog ?? null} paper={status?.paper ?? []} />

      <ol className="grid gap-4 md:grid-cols-2">
        {visible.map((item, index) => (
          <IntegrationCard
            key={item.id}
            def={item}
            ctx={ctx}
            configured={configured}
            jack={String(index + 1).padStart(2, "0")}
          />
        ))}
      </ol>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-black/15 bg-paper px-3 py-2 font-mono text-sm text-ticket-ink placeholder:text-ticket-ink/40"
      />
    </label>
  );
}

function IntegrationCard({
  def,
  ctx,
  configured,
  jack,
}: {
  def: IntegrationDef;
  ctx: IntegrationContext;
  configured: Record<string, boolean>;
  jack: string;
}) {
  const action = actionFor(def, ctx, configured);
  const laneLabel =
    def.lane === "live" ? "Live" : def.lane === "env" ? (action.connected ? "Key on" : "Key off") : "Catalog";

  return (
    <li className="print-ticket flex flex-col rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
            {laneLabel} · {FAMILY_LABEL[def.family]} · {def.stamp}
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none tracking-wide text-fluorescent">{def.name}</h2>
        </div>
        <span className="font-mono text-xs text-aluminum-dim">JACK {jack}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-aluminum">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cone">Beginner · </span>
        {def.dummy}
      </p>
      <p className="mt-2 text-sm leading-6 text-fluorescent/90">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ticket">Expert · </span>
        {def.genius}
      </p>

      {def.tool === "mpg" ? <MpgTool ctx={ctx} /> : null}
      {def.tool === "vin" ? <VinTool ctx={ctx} /> : null}
      {def.tool === "recalls" ? <RecallsTool ctx={ctx} /> : null}
      {def.tool === "geocode" ? <GeocodeTool ctx={ctx} /> : null}
      {def.tool === "youtube" ? <YoutubeTool ctx={ctx} /> : null}
      {def.id === "tecdoc" || def.id === "motor-identifix" || def.id === "chrome-data" || def.id === "partstech" ? (
        <LicensedTool id={def.id} />
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        <a
          href={action.href}
          target={action.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="rounded-sm bg-ticket px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          {action.label}
        </a>
        {def.appPath && def.lane === "live" ? (
          <a
            href={def.appPath}
            className="rounded-sm border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:text-fluorescent"
          >
            In-bay desk
          </a>
        ) : null}
      </div>
    </li>
  );
}

function MpgTool({ ctx }: { ctx: IntegrationContext }) {
  const [rows, setRows] = useState<Array<{ id: string; label: string; combinedMpg: number | null; cityMpg: number | null; highwayMpg: number | null }>>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup() {
    if (!ctx.year || !ctx.make || !ctx.model) {
      setError("Fill year, make, and model on the ticket.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams({ year: ctx.year, make: ctx.make, model: ctx.model });
      const response = await fetch(`/api/integrations/mpg?${params}`);
      const body = (await response.json()) as { rows?: typeof rows; error?: string };
      if (!response.ok) {
        setError(body.error || "EPA did not answer.");
        setRows([]);
        return;
      }
      setRows(body.rows ?? []);
      if (!(body.rows ?? []).length) setError("No EPA row for that exact name. Open Find-a-Car.");
    } catch {
      setError("FuelEconomy.gov did not finish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-sm border border-white/10 bg-bay/50 p-3">
      <button
        type="button"
        onClick={() => void lookup()}
        disabled={busy}
        className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
      >
        {busy ? "Walking the EPA menu…" : "Look up MPG here"}
      </button>
      {error ? <p className="mt-2 text-xs text-cone">{error}</p> : null}
      {rows.length ? (
        <ul className="mt-2 space-y-1 font-mono text-xs text-fluorescent">
          {rows.slice(0, 4).map((row) => (
            <li key={row.id}>
              {row.combinedMpg ?? "—"} comb · {row.cityMpg ?? "—"} city · {row.highwayMpg ?? "—"} hwy
              <span className="block text-aluminum">{row.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function VinTool({ ctx }: { ctx: IntegrationContext }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function decode() {
    if (!ctx.vin.trim()) {
      setNote("Put a 17-character VIN on the ticket.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/integrations/nhtsa?kind=vin&vin=${encodeURIComponent(ctx.vin)}`);
      const body = (await response.json()) as {
        specs?: { year?: string; make?: string; model?: string; engineDisplacement?: string };
        error?: string;
      };
      if (!response.ok) {
        setNote(body.error || "vPIC did not decode that VIN.");
        return;
      }
      const specs = body.specs;
      setNote(
        specs
          ? `${specs.year} ${specs.make} ${specs.model} ${specs.engineDisplacement ?? ""}`.trim()
          : "Decoded. Open the official page to print the extract.",
      );
    } catch {
      setNote("vPIC line dropped. Open the decoder page.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-sm border border-white/10 bg-bay/50 p-3">
      <button type="button" onClick={() => void decode()} disabled={busy} className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
        {busy ? "Decoding…" : "Decode VIN here"}
      </button>
      {note ? <p className="mt-2 text-xs leading-5 text-aluminum">{note}</p> : null}
    </div>
  );
}

function RecallsTool({ ctx }: { ctx: IntegrationContext }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function pull() {
    const vin = ctx.vin.trim();
    if (vin.length === 17) {
      setBusy(true);
      try {
        const response = await fetch(`/api/integrations/nhtsa?kind=vin-campaign&vin=${encodeURIComponent(vin)}`);
        const body = (await response.json()) as {
          campaigns?: Array<{ campaignNumber: string; component: string }>;
          note?: string;
          error?: string;
        };
        if (!response.ok) {
          setNote(body.error || "SaferCar did not answer.");
          return;
        }
        const list = body.campaigns ?? [];
        setNote(
          `${list.length} nameplate campaign${list.length === 1 ? "" : "s"}. ${body.note ?? "Open vs closed is on nhtsa.gov."}`,
        );
      } catch {
        setNote("Recall line dropped. Open NHTSA.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!ctx.year || !ctx.make || !ctx.model) {
      setNote("Fill year, make, and model — or put a 17-character VIN on the ticket.");
      return;
    }
    setBusy(true);
    try {
      const params = new URLSearchParams({ kind: "recalls", year: ctx.year, make: ctx.make, model: ctx.model });
      const response = await fetch(`/api/integrations/nhtsa?${params}`);
      const body = (await response.json()) as { recalls?: Array<{ campaignNumber: string; component: string }>; error?: string };
      if (!response.ok) {
        setNote(body.error || "SaferCar did not answer.");
        return;
      }
      const list = body.recalls ?? [];
      setNote(
        list.length
          ? `${list.length} campaign${list.length === 1 ? "" : "s"} on this nameplate. VIN check still happens on NHTSA.`
          : "No campaigns on this exact name. Still open SaferCar with the VIN.",
      );
    } catch {
      setNote("Recall line dropped. Open NHTSA.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-sm border border-white/10 bg-bay/50 p-3">
      <button type="button" onClick={() => void pull()} disabled={busy} className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
        {busy ? "Pulling campaigns…" : "Pull campaigns here"}
      </button>
      {note ? <p className="mt-2 text-xs leading-5 text-aluminum">{note}</p> : null}
    </div>
  );
}

function GeocodeTool({ ctx }: { ctx: IntegrationContext }) {
  const [note, setNote] = useState("");
  const [mapHref, setMapHref] = useState("");
  const [busy, setBusy] = useState(false);

  async function pin() {
    const q = ctx.address.trim();
    if (!q) {
      setNote("Put a ZIP or city on the ticket.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/integrations/geocode?q=${encodeURIComponent(q)}`);
      const body = (await response.json()) as { label?: string; lat?: number; lon?: number; map?: string; error?: string };
      if (!response.ok) {
        setNote(body.error || "Nominatim could not place that.");
        setMapHref("");
        return;
      }
      setNote(`${body.label ?? q} · ${body.lat}, ${body.lon}`);
      setMapHref(body.map ?? "");
    } catch {
      setNote("Nominatim line dropped. Open the search UI.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-sm border border-white/10 bg-bay/50 p-3">
      <button type="button" onClick={() => void pin()} disabled={busy} className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
        {busy ? "Pinning…" : "Pin this ZIP here"}
      </button>
      {note ? <p className="mt-2 text-xs leading-5 text-aluminum">{note}</p> : null}
      {mapHref ? (
        <a href={mapHref} rel="noreferrer" className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-ticket">
          Open pin on OSM
        </a>
      ) : null}
    </div>
  );
}

function YoutubeTool({ ctx }: { ctx: IntegrationContext }) {
  const [note, setNote] = useState("");
  const [clips, setClips] = useState<Array<{ videoId: string; title: string; url: string }>>([]);
  const [busy, setBusy] = useState(false);

  async function search() {
    setBusy(true);
    setNote("");
    try {
      const params = new URLSearchParams({
        q: ctx.howTo || ctx.part,
        year: ctx.year,
        make: ctx.make,
        model: ctx.model,
      });
      const response = await fetch(`/api/integrations/youtube?${params}`);
      const body = (await response.json()) as {
        youtube?: { videos?: Array<{ videoId: string; title: string; url: string }>; note?: string; usedApi?: boolean };
        error?: string;
      };
      if (!response.ok) {
        setNote(body.error || "YouTube desk failed. Open the results page.");
        return;
      }
      setClips(body.youtube?.videos ?? []);
      setNote(body.youtube?.note || (body.youtube?.usedApi ? "Clips from the Data API." : "No key — use Open for the results page."));
    } catch {
      setNote("YouTube line dropped. Open the search.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-sm border border-white/10 bg-bay/50 p-3">
      <button type="button" onClick={() => void search()} disabled={busy} className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">
        {busy ? "Asking YouTube…" : "List related clips"}
      </button>
      {note ? <p className="mt-2 text-xs leading-5 text-aluminum">{note}</p> : null}
      {clips.length ? (
        <ul className="mt-2 space-y-1 text-xs">
          {clips.map((clip) => (
            <li key={clip.videoId}>
              <a href={clip.url} rel="noreferrer" className="text-fluorescent underline">
                {clip.title}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LicensedTool({ id }: { id: string }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    const path =
      id === "chrome-data"
        ? "/api/integrations/chrome"
        : id === "motor-identifix"
          ? "/api/integrations/motor"
          : id === "partstech"
            ? "/api/integrations/partstech"
            : "/api/integrations/catalog";
    let cancelled = false;
    fetch(path)
      .then((res) => res.json())
      .then((body: { configured?: boolean; unlocks?: string; note?: string; skus?: unknown[] }) => {
        if (cancelled) return;
        const empty = Array.isArray(body.skus) ? `skus:${body.skus.length}` : "empty";
        setNote(`configured:${String(body.configured ?? false)} · ${empty}. ${body.unlocks || body.note || ""}`);
      })
      .catch(() => {
        if (!cancelled) setNote("Adapter dark. No invented catalog.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mt-4 rounded-sm border border-dashed border-white/15 bg-bay/50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cone">Empty licensed bay</p>
      {note ? <p className="mt-2 text-xs leading-5 text-aluminum">{note}</p> : null}
    </div>
  );
}
