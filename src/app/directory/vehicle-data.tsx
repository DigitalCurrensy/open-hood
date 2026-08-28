"use client";

import { useEffect, useState } from "react";
import type { EpaMpgRow, NhtsaComplaintSummary, NhtsaRatingRow, NhtsaRecallSummary } from "@/lib/directory/types";
import { EXAMPLE_VEHICLE, EXTERNAL_REL, vehiclePublicLinks } from "@/lib/directory/vehicle-links";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function VehicleDataStrip({
  year,
  make,
  model,
}: {
  year?: string;
  make?: string;
  model?: string;
}) {
  const [vehicle] = useIdentifiedVehicle();
  const y = year || vehicle?.specs.year || EXAMPLE_VEHICLE.year;
  const mk = make || vehicle?.specs.make || EXAMPLE_VEHICLE.make;
  const md = model || vehicle?.specs.model || EXAMPLE_VEHICLE.model;
  const example = !year && !vehicle?.specs.year;
  const links = vehiclePublicLinks(y, mk, md);
  const [mpg, setMpg] = useState<EpaMpgRow[] | null>(null);
  const [complaints, setComplaints] = useState<NhtsaComplaintSummary | null>(null);
  const [ratings, setRatings] = useState<NhtsaRatingRow[] | null>(null);
  const [recalls, setRecalls] = useState<NhtsaRecallSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!y || !mk || !md) return;
    const params = new URLSearchParams({ year: y, make: mk, model: md });
    let cancelled = false;
    setError("");
    Promise.all([
      fetch(`/api/directory/mpg?${params}`).then((res) => res.json()),
      fetch(`/api/directory/complaints?${params}`).then((res) => res.json()),
      fetch(`/api/directory/ratings?${params}`).then((res) => res.json()),
      fetch(`/api/directory/recalls?${params}`).then((res) => res.json()),
    ])
      .then(([mpgBody, complaintBody, ratingBody, recallBody]) => {
        if (cancelled) return;
        setMpg(Array.isArray(mpgBody.rows) ? mpgBody.rows : []);
        setComplaints(complaintBody.count != null ? complaintBody : null);
        setRatings(Array.isArray(ratingBody.rows) ? ratingBody.rows : []);
        setRecalls(recallBody.count != null ? recallBody : null);
      })
      .catch(() => {
        if (!cancelled) setError("EPA / SaferCar lookup did not finish. Try again from this desk.");
      });
    return () => {
      cancelled = true;
    };
  }, [y, mk, md]);

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/60 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">
        EPA + SaferCar + IIHS · no key{example ? " · example" : ""}
      </p>
      <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">
        {y} {mk} {md}
      </h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        {example
          ? "No vehicle on this desk yet. This is the 2018 Honda Civic sample so the public numbers stay visible."
          : "Official MPG from FuelEconomy.gov. Complaint counts, recalls, and NCAP stars from api.nhtsa.gov. IIHS is a link-out. Not a Carfax."}
      </p>
      {error ? <p className="mt-3 text-sm text-cone">{error}</p> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">EPA MPG</p>
          <ul className="mt-2 space-y-2 text-sm text-fluorescent">
            {(mpg ?? []).slice(0, 2).map((row) => (
              <li key={row.id}>
                <span className="font-mono text-ticket">
                  {row.cityMpg ?? "—"}/{row.highwayMpg ?? "—"}/{row.combinedMpg ?? "—"}
                </span>
                <span className="ml-2 text-aluminum">city/hwy/comb · {row.label}</span>
              </li>
            ))}
            {mpg && mpg.length === 0 ? <li className="text-aluminum">No EPA row for that exact name.</li> : null}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">NHTSA complaints</p>
          {complaints ? (
            <p className="mt-2 text-sm leading-6 text-fluorescent">
              {complaints.count} filed · crash {complaints.crash} · fire {complaints.fire}
              {complaints.topComponents[0] ? (
                <span className="block text-aluminum">Top: {complaints.topComponents.slice(0, 3).join(" · ")}</span>
              ) : null}
            </p>
          ) : (
            <p className="mt-2 text-sm text-aluminum">Pulling SaferCar…</p>
          )}
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">NCAP stars</p>
          <ul className="mt-2 space-y-1 text-sm text-fluorescent">
            {(ratings ?? []).slice(0, 2).map((row) => (
              <li key={row.vehicleId}>
                Overall {row.overall} · {row.description || "variant"}
              </li>
            ))}
            {ratings && ratings.length === 0 ? <li className="text-aluminum">No star rating on file for that name.</li> : null}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">Recalls</p>
          {recalls ? (
            <p className="mt-2 text-sm leading-6 text-fluorescent">
              {recalls.count} campaigns
              {recalls.campaigns[0] ? (
                <span className="block font-mono text-[11px] text-aluminum">{recalls.campaigns.slice(0, 3).join(" · ")}</span>
              ) : null}
            </p>
          ) : (
            <p className="mt-2 text-sm text-aluminum">Pulling SaferCar…</p>
          )}
        </div>
      </div>
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
        <a href={links.epaModel} target="_blank" rel={EXTERNAL_REL} className="text-ticket hover:text-fluorescent">
          EPA FuelEconomy
        </a>
        <a href={links.iihs} target="_blank" rel={EXTERNAL_REL} className="text-ticket hover:text-fluorescent">
          IIHS ratings
        </a>
        <a href={links.nhtsaRecalls} target="_blank" rel={EXTERNAL_REL} className="text-ticket hover:text-fluorescent">
          NHTSA recalls
        </a>
        <a href={links.nhtsaVehicle} target="_blank" rel={EXTERNAL_REL} className="text-ticket hover:text-fluorescent">
          SaferCar vehicle
        </a>
      </p>
    </section>
  );
}
