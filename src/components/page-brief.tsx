"use client";

import { usePathname } from "next/navigation";
import { TICKET_PATH } from "@/app/_components/ticket-path";
import { BayLink } from "@/components/bay-link";
import { briefForPath } from "@/config/nav/ux";

const ANSWERS = [
  { key: "for" as const, beginner: "Who", expert: "Audience" },
  { key: "click" as const, beginner: "Click", expert: "Control" },
  { key: "say" as const, beginner: "Say", expert: "Counter" },
];

const PATH_BRIEFS = new Set(["/", "/how-it-works"]);

export function PageBrief({ href }: { href?: string }) {
  const pathname = usePathname();
  const brief = briefForPath(href ?? pathname ?? "");
  if (!brief) return null;

  return (
    <section aria-label="Page brief" className="rounded-sm border border-white/10 bg-bay-2/80">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/10 px-4 py-2.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">{brief.eyebrow}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
          <span data-label-dummy>Beginner · short steps</span>
          <span data-label-shop>Expert · spec · code · mm</span>
        </p>
      </div>

      <div className="page-brief-altitudes flex flex-col gap-2 px-3 pt-3">
        <p
          data-altitude="dummy"
          className="ticket-paper rounded-sm px-4 py-3 text-sm leading-6 text-ticket-ink"
        >
          {brief.dummy.job}
        </p>
        <p
          data-altitude="genius"
          className="rounded-sm border border-white/10 px-4 py-3 font-mono text-xs leading-6 text-fluorescent"
        >
          {brief.genius.job}
        </p>
      </div>

      <dl className="grid gap-3 px-4 py-4 sm:grid-cols-3">
        {ANSWERS.map((answer) => (
          <div key={answer.key} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">
              <span data-label-dummy>{answer.beginner}</span>
              <span data-label-shop>{answer.expert}</span>
            </dt>
            <dd className="page-brief-answer mt-1 text-sm leading-6 text-aluminum">
              <span data-altitude="dummy">{brief.dummy[answer.key]}</span>
              <span data-altitude="genius">{brief.genius[answer.key]}</span>
            </dd>
          </div>
        ))}
      </dl>

      {PATH_BRIEFS.has(brief.href) ? (
        <nav
          aria-label="Ticket path stamps"
          className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 py-3"
        >
          <p className="w-full font-mono text-[10px] uppercase tracking-[0.22em] text-cone">
            Ticket path · we send a script
          </p>
          {TICKET_PATH.map((step, index) => (
            <span key={step.id} className="flex items-center gap-1.5">
              {index > 0 ? <span className="text-aluminum/50" aria-hidden>→</span> : null}
              <BayLink
                href={step.href}
                title={step.line}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-ticket hover:text-fluorescent"
              >
                {step.stamp}
              </BayLink>
            </span>
          ))}
        </nav>
      ) : null}
    </section>
  );
}
