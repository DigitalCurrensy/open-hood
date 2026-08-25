import Link from "next/link";
import { JOB_ROLES, JOB_TOOLS } from "@/config/nav/jobs";
import { DTC_COUNT } from "@/lib/jobs/dtc-dictionary";

export function Switchboard() {
  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {JOB_ROLES.map((role) => (
          <Link
            key={role.href}
            href={role.href}
            className="group rounded-sm border border-white/10 bg-bay-2/80 p-4 hover:border-ticket/50"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
              {String(role.pipeline).padStart(2, "0")} · {role.stamp}
            </p>
            <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent group-hover:text-ticket">
              {role.label}
            </h2>
            <p className="mt-2 text-sm leading-6 text-aluminum">{role.blurb}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {JOB_TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} className="ticket-paper rounded-sm p-5 text-ticket-ink">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">{tool.stamp}</p>
            <h2 className="mt-1 font-display text-3xl uppercase leading-none">{tool.label}</h2>
            <p className="mt-3 text-sm leading-6">{tool.blurb}</p>
          </Link>
        ))}
      </section>

      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
        {DTC_COUNT} DTCs in the jobs book · no live dealer inventory · build log stays at /builds
      </p>
    </div>
  );
}
