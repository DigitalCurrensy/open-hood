import Link from "next/link";
import { CopyScript } from "@/app/expert/_components/copy-script";
import { PlaybookSteps } from "@/app/expert/_components/playbook-steps";
import { audienceLabel, componentsForPlaybook, patternsForExpertPlaybook } from "@/app/expert/_data/book";
import type { Playbook } from "@/lib/expert/types";

export function PlaybookDetail({
  playbook,
  related,
}: {
  playbook: Playbook;
  related: Playbook[];
}) {
  const patterns = patternsForExpertPlaybook(playbook.id);
  const buckets = componentsForPlaybook(playbook.id);

  return (
    <div className="space-y-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">
        <Link href="/expert" className="text-ticket hover:text-fluorescent">
          Playbooks
        </Link>
        {" · "}
        {playbook.stamp} · {audienceLabel(playbook.audience)}
      </p>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">{playbook.kicker}</p>
          <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-fluorescent sm:text-5xl">
            {playbook.title}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-aluminum">{playbook.plainEnglish}</p>
      </header>

      <p className="rounded-sm border border-white/10 bg-bay-2/60 px-4 py-3 text-sm leading-6 text-aluminum">
        {playbook.scenario}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Beginner steps</p>
            <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">What you do</h2>
          </div>
          <PlaybookSteps playbookId={playbook.id} steps={playbook.dummySteps} />
          <div className="rounded-sm border border-grease/40 bg-bay-2/80 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Do not</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-aluminum">
              {playbook.dont.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Expert notes</p>
            <h2 className="mt-1 font-display text-3xl uppercase text-fluorescent">What the number means</h2>
          </div>
          <ul className="space-y-3">
            {playbook.geniusNotes.map((note) => (
              <li key={note.id} className="rounded-sm border border-white/10 bg-bay-2/80 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">
                  {note.label}
                  {note.unit ? ` · ${note.unit}` : ""}
                </p>
                <p className="mt-2 text-sm leading-6 text-aluminum">{note.meaning}</p>
              </li>
            ))}
          </ul>

          <aside className="ticket-paper flex flex-col gap-4 rounded-sm p-5 text-ticket-ink">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Say this at the window</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
              {playbook.script.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <CopyScript lines={playbook.script} />
          </aside>
        </section>
      </div>

      <section>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Open a live desk</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {playbook.links.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                className="block rounded-sm border border-white/10 bg-bay-2/80 p-4 hover:border-ticket/50"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket">{link.stamp}</p>
                <p className="mt-1 font-display text-xl uppercase text-fluorescent">{link.label}</p>
                <p className="mt-1 text-sm leading-6 text-aluminum">{link.why}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {buckets.length ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          SaferCar buckets this card answers: {buckets.join(" · ")} · not CR
        </p>
      ) : null}

      {patterns.length ? (
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Related patterns</p>
          <p className="mt-1 text-sm text-aluminum">
            Common failures by symptom. SaferCar pointers — not pirated TSB PDFs.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {patterns.map((pattern) => (
              <li key={pattern.id}>
                <Link
                  href={`/expert/tsb#${pattern.id}`}
                  className="inline-block rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ticket hover:border-ticket"
                >
                  {pattern.stamp}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">Next playbooks</p>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {related.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/expert/${row.slug}`}
                  className="block rounded-sm border border-white/10 bg-bay-2/60 p-4 hover:border-ticket/50"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">{row.stamp}</p>
                  <p className="mt-1 font-display text-xl uppercase text-fluorescent">{row.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
