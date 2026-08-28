"use client";

import Link from "next/link";
import { useMemo } from "react";
import { JobAisle } from "@/app/finder/_components/job-aisle";
import { aisleTickets } from "@/lib/finder/links";
import { answerAisle } from "@/lib/finder/jobs";
import type { FinderAisleAnswer, FinderJob, FinderPartTicket } from "@/lib/finder/types";
import { ymmFromRecord } from "@/lib/finder/ymm";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";

export function FinderAislePage({
  job,
  aisle,
  parts,
  related,
}: {
  job: FinderJob;
  aisle: FinderAisleAnswer[];
  parts: FinderPartTicket[];
  related: Array<{ slug: string; stamp: string; title: string }>;
}) {
  const [vehicle] = useIdentifiedVehicle();
  const ymm = useMemo(
    () =>
      ymmFromRecord({
        year: vehicle?.specs.year,
        make: vehicle?.specs.make,
        model: vehicle?.specs.model,
        engineDisplacement: vehicle?.specs.engineDisplacement,
        engineModel: vehicle?.specs.engineModel,
        cylinders: vehicle?.specs.cylinders,
        driveType: vehicle?.specs.driveType,
      }),
    [vehicle],
  );
  const liveAisle = ymm.year || ymm.engine || ymm.drive ? answerAisle(job, ymm) : aisle;
  const liveParts = ymm.year || ymm.make || ymm.model ? aisleTickets(job.parts, ymm) : parts;

  return (
    <div className="space-y-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">
        <Link href="/finder" className="text-ticket hover:text-fluorescent">
          Fix Finder
        </Link>
        {" · "}
        {job.stamp}
      </p>
      <JobAisle job={job} ymm={ymm} aisle={liveAisle} parts={liveParts} related={related} heading="h1" />
    </div>
  );
}
