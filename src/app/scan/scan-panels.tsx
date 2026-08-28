import Link from "next/link";
import { FREEZE_FRAME_ASK, FREEZE_FRAME_LINE, PIDS_SUPPORTED } from "@/lib/obd";
import { DARK_HOURS_STAMP, VISION_OFF_STAMP, VISION_ON_STAMP } from "@/lib/quote";

export function ScanPanels() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
      <section className="ticket-paper rounded-sm p-5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Freeze-frame · print this</p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">What the shop should print</h2>
        <p className="mt-2 text-sm leading-6">
          Live RPM and coolant on this desk are <em>now</em>. Freeze-frame is the snapshot from when the code{" "}
          <em>set</em>. A converter quote without these numbers is a guess.
        </p>
        <ol className="mt-4 space-y-3">
          {FREEZE_FRAME_ASK.map((row, index) => (
            <li key={row.id} className="border-t border-ticket-ink/15 pt-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                {String(index + 1).padStart(2, "0")} · {row.label}
              </p>
              <p className="mt-1 text-sm leading-6">{row.why}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-ticket-ink/20 pt-3 text-sm leading-6">{FREEZE_FRAME_LINE}</p>
      </section>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Vs the dongle apps</p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
          Car Scanner · Torque · FIXD
        </h2>
        <dl className="mt-4 space-y-4 text-sm leading-6 text-aluminum">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">This bay</dt>
            <dd className="mt-1">
              Three generic Mode 01 PIDs and stored Mode 03 codes over Web Bluetooth, or a typed code into the existing
              dictionary. English and the freeze-frame ask. No puck for sale.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Car Scanner / Torque</dt>
            <dd className="mt-1">
              They win the computer: graphs, logs, maker screens, readiness, Classic Bluetooth SPP on Android. If you
              already own that puck, use their app and paste the code here.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">FIXD</dt>
            <dd className="mt-1">They sell a puck and a subscription. We do not. Type what their screen printed.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ticket">Snap-on / Autel</dt>
            <dd className="mt-1">
              Factory-level, bi-directional, module scan. This page does not replace those tools. Do not let a writer
              tell you it does.
            </dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">PIDs this bay reads</p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-fluorescent">
            {PIDS_SUPPORTED.map((pid) => (
              <li key={pid.request}>
                {pid.mode === "03" ? "Mode 03" : `Mode ${pid.mode} PID ${pid.pid}`} · {pid.short} · {pid.formula}
              </li>
            ))}
          </ul>
        </div>
      </section>
      </div>
      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Paper RO</p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-wide text-fluorescent">
          Photograph the ticket on /quote
        </h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          {VISION_ON_STAMP} when OPENAI_API_KEY is set (usedCloud:true). {VISION_OFF_STAMP} Tesseract still parses
          dollars — it is not vision. Hours stamp {DARK_HOURS_STAMP} unless a Motor or Mitchell extract answers.
        </p>
        <Link
          href="/quote"
          className="mt-4 inline-flex min-h-11 items-center rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Open quote desk
        </Link>
      </section>
    </div>
  );
}
