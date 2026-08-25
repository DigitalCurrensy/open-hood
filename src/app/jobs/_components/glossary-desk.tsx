"use client";

import { useMemo, useState } from "react";
import { RO_TERMS, searchRoTerms } from "@/lib/jobs/glossary";
import type { RoTerm } from "@/lib/jobs/types";

const GROUPS: RoTerm["group"][] = ["service", "brakes", "steering", "trans", "ticket", "diag", "hvac", "tires"];

export function GlossaryDesk({ kicker = "Type LOF, MPI, NTF…" }: { kicker?: string }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<RoTerm["group"] | "all">("all");

  const rows = useMemo(() => {
    const found = searchRoTerms(query);
    return group === "all" ? found : found.filter((term) => term.group === group);
  }, [query, group]);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">{kicker}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="LOF"
            className="mt-2 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 font-mono text-lg uppercase tracking-[0.14em] text-fluorescent placeholder:text-aluminum/40"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip active={group === "all"} onClick={() => setGroup("all")}>
            {`All ${RO_TERMS.length}`}
          </Chip>
          {GROUPS.map((name) => (
            <Chip key={name} active={group === name} onClick={() => setGroup(name)}>
              {name}
            </Chip>
          ))}
        </div>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {rows.map((term) => (
          <li key={term.slug} className="rounded-sm border border-white/10 bg-bay-2/80 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{term.group}</p>
            <h3 className="font-display text-2xl uppercase tracking-wide text-fluorescent">{term.term}</h3>
            <p className="mt-1 text-sm leading-6 text-aluminum">{term.means}</p>
            <p className="mt-2 text-sm leading-6 text-fluorescent">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ticket">Say · </span>
              {term.sayToOwner}
            </p>
            <p className="mt-2 border-l-2 border-cone pl-3 text-sm leading-6 text-aluminum">{term.trap}</p>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="text-sm text-aluminum">No hit. Try LOF, alignment, trans service, NTF, or shop supplies.</p>
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
        active ? "bg-ticket text-ticket-ink" : "border border-white/10 text-aluminum hover:text-fluorescent"
      }`}
    >
      {children}
    </button>
  );
}
