import Link from "next/link";
import { AisleQuestions, AisleRack } from "@/app/finder/_components/aisle-rack";
import { JobSplit } from "@/app/finder/_components/job-split";
import type { FinderAisleAnswer, FinderJob, FinderPartTicket, FinderYmm } from "@/lib/finder/types";

const LANE: Record<FinderJob["lane"], string> = {
  diagnose: "Diagnose first",
  replace: "Replace",
  inspect: "Inspect",
};

export function JobAisle({
  job,
  ymm,
  aisle,
  parts,
  related,
  heading = "h2",
}: {
  job: FinderJob;
  ymm: FinderYmm;
  aisle: FinderAisleAnswer[];
  parts: FinderPartTicket[];
  related: Array<{ slug: string; stamp: string; title: string }>;
  heading?: "h1" | "h2";
}) {
  const Title = heading;
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">
            {job.stamp} · {LANE[job.lane]}
          </p>
          <Title className="font-display text-4xl uppercase leading-none tracking-wide text-fluorescent sm:text-5xl">
            {job.title}
          </Title>
        </div>
        <p className="max-w-md text-sm leading-6 text-aluminum">{job.plainEnglish}</p>
      </header>

      <p className="rounded-sm border border-grease/50 bg-bay-2/80 px-4 py-3 text-sm leading-6 text-aluminum">
        {job.doNotThrow}
      </p>

      <JobSplit job={job} />
      <AisleQuestions answers={aisle} />
      <AisleRack tickets={parts} ymm={ymm} />

      {related.length ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          Related:{" "}
          {related.map((row, index) => (
            <span key={row.slug}>
              {index ? " · " : null}
              <Link href={`/finder/${row.slug}`} className="text-ticket hover:text-fluorescent">
                {row.stamp}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
