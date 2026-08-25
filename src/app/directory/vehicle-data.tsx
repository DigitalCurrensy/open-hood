"use client";

import { useEffect, useState } from "react";
import type { EpaMpgRow, NhtsaComplaintSummary, NhtsaRatingRow } from "@/lib/directory/types";
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
  const y = year || vehicle?.specs.year || "";
  const mk = make || vehicle?.specs.make || "";
  const md = model || vehicle?.specs.model || "";
  const [mpg, setMpg] = useState<EpaMpgRow[] | null>(null);
  const [complaints, setComplaints] = useState<NhtsaComplaintSummary | null>(null);
  const [ratings, setRatings] = useState<NhtsaRatingRow[] | null>(null);
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
    ])
      .then(([mpgBody, complaintBody, ratingBody]) => {
        if (cancelled) return;
        setMpg(Array.isArray(mpgBody.rows) ? mpgBody.rows : []);
        setComplaints(complaintBody.count != null ? complaintBody : null);
        setRatings(Array.isArray(ratingBody.rows) ? ratingBody.rows : []);
      })
      .catch(() => {
        if (!cancelled) setError("EPA / SaferCar lookup did not finish. Try again from this desk.");
      });
    return () => {
      cancelled = true;
    };
  }, [y, mk, md]);

  if (!y || !mk || !md) return null;

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/60 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">EPA + SaferCar · no key</p>
      <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">
        {y} {mk} {md}
      </h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        Official MPG from FuelEconomy.gov. Complaint counts and NCAP stars from api.nhtsa.gov. Not a Carfax.
      </p>
      {error ? <p className="mt-3 text-sm text-cone">{error}</p> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">EPA combined</p>
          <ul className="mt-2 space-y-2 text-sm text-fluorescent">
            {(mpg ?? []).slice(0, 3).map((row) => (
              <li key={row.id}>
                <span className="font-mono text-ticket">{row.combinedMpg ?? "—"}</span>
                <span className="ml-2 text-aluminum">{row.label}</span>
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
      </div>
    </section>
  );
}
