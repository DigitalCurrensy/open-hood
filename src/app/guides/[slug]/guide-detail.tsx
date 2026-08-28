import Link from "next/link";
import { RelatedYoutube } from "@/app/guides/[slug]/related-youtube";
import {
  difficultyLabel,
  familyLabel,
  familyStamp,
  guideSearchQuery,
  guideVideoHref,
} from "@/lib/guides/glossary";
import type { Guide } from "@/lib/guides/types";
import { youtubeEmbedUrl } from "@/lib/guides/youtube";

const ROLE_LABEL: Record<Guide["jobRoles"][number], string> = {
  owner: "Owner",
  DIY: "DIY",
  tech: "Tech",
  "service-writer": "Writer",
};

export function GuideDetail({ guide, related }: { guide: Guide; related: Guide[] }) {
  const canEmbed = Boolean(guide.verified && guide.youtube.videoId);
  const watchHref = guideVideoHref(guide);

  return (
    <div className="space-y-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">
        <Link href="/guides" className="text-ticket hover:text-fluorescent">
          How-to
        </Link>
        {" · "}
        {familyStamp(guide.jobFamily)} · {familyLabel(guide.jobFamily)}
      </p>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">
            {guide.diySafe ? "DIY-safe driveway job" : "Watch so you can ask — not always DIY"}
          </p>
          <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-fluorescent sm:text-5xl">
            {guide.title}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-aluminum">{guide.plainEnglish}</p>
      </header>

      <dl className="grid gap-3 sm:grid-cols-3">
        <Meta label="Difficulty" value={`${guide.difficulty}/5 · ${difficultyLabel(guide.difficulty)}`} />
        <Meta label="Time" value={guide.timeEstimate} />
        <Meta label="Roles" value={guide.jobRoles.map((role) => ROLE_LABEL[role]).join(" · ")} />
      </dl>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4">
          {guide.safetyNotes.length ? (
            <div className="rounded-sm border-l-4 border-cone bg-bay-2/80 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Safety</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-aluminum">
                {guide.safetyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Steps · beginner-friendly</p>
            <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-sm leading-6 text-fluorescent">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ListCard title="Tools" items={guide.toolsNeeded} empty="No special tools." />
            <ListCard title="Parts" items={guide.partsNeeded} empty="No parts to buy first." />
          </div>
        </section>

        <section className="space-y-4">
          <div className="overflow-hidden rounded-sm border border-white/10 bg-bay-2/80">
            {canEmbed ? (
              <iframe
                src={youtubeEmbedUrl(guide.youtube.videoId)}
                title={guide.youtube.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full bg-bay"
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-bay px-6 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">
                  No invented video ID
                </p>
                <p className="text-sm leading-6 text-aluminum">
                  We did not verify a single honest clip for this job. Search YouTube with the query we would have used.
                </p>
                <a
                  href={watchHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-ticket-ink"
                >
                  YouTube search
                </a>
              </div>
            )}
            <div className="space-y-2 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">{guide.youtube.channel}</p>
              <p className="font-display text-2xl uppercase leading-none text-fluorescent">{guide.youtube.title}</p>
              <p className="text-sm leading-6 text-aluminum">{guide.youtube.whyThisVideo}</p>
              {canEmbed ? (
                <a
                  href={watchHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket"
                >
                  Watch on YouTube
                </a>
              ) : null}
            </div>
          </div>

          <div className="ticket-paper rounded-sm p-5 text-ticket-ink">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]">
              If you are not DIY · say this instead
            </p>
            <p className="mt-2 text-base leading-7">{guide.shopSentence}</p>
          </div>

          <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Ask at the shop</p>
            <p className="mt-2 text-sm leading-6 text-aluminum">{guide.askAtTheShop}</p>
          </div>

          <RelatedYoutube guideId={guide.id} fallbackQuery={guideSearchQuery(guide)} />
        </section>
      </div>

      {related.length ? (
        <section>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cone">Related jobs</p>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {related.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/guides/${other.id}`}
                  className="block rounded-sm border border-white/10 bg-bay-2/80 p-4 hover:border-ticket/50"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ticket">
                    {familyStamp(other.jobFamily)}
                  </p>
                  <p className="font-display text-xl uppercase text-fluorescent">{other.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-aluminum">{other.plainEnglish}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {guide.relatedPartTypes.length ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          Parts ·{" "}
          {guide.relatedPartTypes.map((part, index) => (
            <span key={part}>
              {index > 0 ? " · " : null}
              <Link href={`/guides?part=${encodeURIComponent(part)}`} className="text-ticket hover:text-fluorescent">
                {part}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-bay-2/80 px-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">{label}</dt>
      <dd className="mt-1 text-sm text-fluorescent">{value}</dd>
    </div>
  );
}

function ListCard({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-bay-2/80 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cone">{title}</p>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-aluminum">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-aluminum">{empty}</p>
      )}
    </div>
  );
}
