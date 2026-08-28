"use client";

import { MediaCapture, type CompressedImage } from "@/components/media-capture";
import { useReadingLevel } from "@/components/reading-level";
import { CONTACT_API_PATH } from "@/config/nav/contact";
import {
  CONTACT_MAX_PHOTO_BYTES,
  CONTACT_NEEDS,
  CONTACT_ROLES,
  CONTACT_WINDOWS,
  type ContactDraft,
  type ContactMailerStatus,
  type ContactNeed,
  type ContactRole,
  type ContactSubmitResult,
  type ContactWindow,
} from "@/lib/contact/types";
import { emptyContactDraft } from "@/lib/contact/validate";
import { useIdentifiedVehicle } from "@/lib/vehicle-session";
import { BayLink } from "@/components/bay-link";
import { useState, type FormEvent, type ReactNode } from "react";
import "./contact.css";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

export function ContactDesk({ mailer }: { mailer: ContactMailerStatus }) {
  const [level] = useReadingLevel();
  const expert = level === "expert";
  const [vehicle] = useIdentifiedVehicle();
  const [draft, setDraft] = useState<ContactDraft>(() => emptyContactDraft());
  const [seededFrom, setSeededFrom] = useState("");
  const [fault, setFault] = useState("");
  const [fieldFaults, setFieldFaults] = useState<Partial<Record<keyof ContactDraft, string>>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ContactSubmitResult | null>(null);

  const seedKey = vehicle
    ? [vehicle.specs.vin, vehicle.specs.year, vehicle.specs.make, vehicle.specs.model, vehicle.specs.mileage].join("|")
    : "";
  if (vehicle && seedKey !== seededFrom) {
    setSeededFrom(seedKey);
    setDraft((current) => ({
      ...current,
      vin: current.vin || vehicle.specs.vin || "",
      year: current.year || vehicle.specs.year || "",
      make: current.make || vehicle.specs.make || "",
      model: current.model || vehicle.specs.model || "",
      mileage: current.mileage || vehicle.specs.mileage || "",
    }));
  }

  function patch<K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (fault) setFault("");
    if (fieldFaults[key]) {
      setFieldFaults((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  async function onSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFault("");
    setFieldFaults({});
    try {
      const response = await fetch(CONTACT_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          photo: draft.photo
            ? { mimeType: "image/jpeg" as const, base64: draft.photo.base64, bytes: draft.photo.bytes }
            : null,
        }),
      });
      const body = (await response.json()) as ContactSubmitResult | { ok: false; error?: string; fields?: typeof fieldFaults };
      if (!response.ok || !("ok" in body) || body.ok !== true) {
        const err = body as { error?: string; fields?: typeof fieldFaults };
        setFieldFaults(err.fields ?? {});
        setFault(err.error || "Could not stamp that ticket.");
        return;
      }
      setResult(body);
    } catch {
      setFault("The window did not answer. Check the line and send the RO again.");
    } finally {
      setBusy(false);
    }
  }

  function onPhoto(image: CompressedImage) {
    if (image.bytes > CONTACT_MAX_PHOTO_BYTES) {
      setFault("That JPEG is still over 4 MB. Crop the ticket closer.");
      return;
    }
    patch("photo", { mimeType: "image/jpeg", base64: image.base64, bytes: image.bytes });
  }

  if (result) {
    return <SuccessTicket result={result} onAnother={() => setResult(null)} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
      <form className="contact-carbon rounded-sm border border-white/10 p-5" onSubmit={onSend} noValidate>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
          {expert ? "Shop copy · VIN · window" : "Shop copy · name · RO"}
        </p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide">Send the RO</h2>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          {expert
            ? "Role, VIN, miles, and the callback window. Paste the lines or shoot the estimate."
            : "Name, a phone or email, and the ticket. We do not sell this RO."}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name" error={fieldFaults.name}>
            <input
              required
              name="name"
              autoComplete="name"
              value={draft.name}
              onChange={(event) => patch("name", event.target.value)}
              placeholder="As it should appear on a callback"
              className={FIELD}
            />
          </Field>
          <Field label="Phone" error={fieldFaults.phone}>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={draft.phone}
              onChange={(event) => patch("phone", event.target.value)}
              placeholder="555-0100"
              className={FIELD}
            />
          </Field>
        </div>

        <Field label="Email" error={fieldFaults.email} className="mt-3">
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(event) => patch("email", event.target.value)}
            placeholder="you@example.com"
            className={FIELD}
          />
        </Field>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum">
          Name plus a phone or an email
        </p>

        <ChipSet legend="Who you are" error={fieldFaults.role}>
          {CONTACT_ROLES.map((role) => (
            <Chip
              key={role.id}
              name="role"
              checked={draft.role === role.id}
              onChange={() => patch("role", role.id as ContactRole)}
            >
              {role.label}
            </Chip>
          ))}
        </ChipSet>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="VIN · optional" error={fieldFaults.vin}>
            <input
              name="vin"
              autoComplete="off"
              spellCheck={false}
              value={draft.vin}
              onChange={(event) => patch("vin", event.target.value.toUpperCase())}
              placeholder="17 characters"
              className={`${FIELD} vin-cell font-mono`}
            />
          </Field>
          <Field label="Mileage · optional" error={fieldFaults.mileage}>
            <input
              name="mileage"
              inputMode="numeric"
              autoComplete="off"
              value={draft.mileage}
              onChange={(event) => patch("mileage", event.target.value)}
              placeholder="48210"
              className={`${FIELD} contact-miles`}
            />
          </Field>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Year" error={fieldFaults.year}>
            <input
              name="year"
              inputMode="numeric"
              autoComplete="off"
              value={draft.year}
              onChange={(event) => patch("year", event.target.value)}
              placeholder="2013"
              className={FIELD}
            />
          </Field>
          <Field label="Make" error={fieldFaults.make}>
            <input
              name="make"
              value={draft.make}
              onChange={(event) => patch("make", event.target.value)}
              placeholder="Ford"
              className={FIELD}
            />
          </Field>
          <Field label="Model" error={fieldFaults.model}>
            <input
              name="model"
              value={draft.model}
              onChange={(event) => patch("model", event.target.value)}
              placeholder="F-150"
              className={FIELD}
            />
          </Field>
        </div>

        <ChipSet legend="What you need" error={fieldFaults.need}>
          {CONTACT_NEEDS.map((need) => (
            <Chip
              key={need.id}
              name="need"
              checked={draft.need === need.id}
              onChange={() => patch("need", need.id as ContactNeed)}
            >
              {need.label}
            </Chip>
          ))}
        </ChipSet>

        <Field label="Message / paste the quote" error={fieldFaults.message} className="mt-4">
          <textarea
            name="message"
            rows={expert ? 8 : 6}
            value={draft.message}
            onChange={(event) => patch("message", event.target.value)}
            placeholder="Paste the RO lines, or the noise and when it happens."
            className={FIELD}
          />
        </Field>

        <div className="mt-4">
          <MediaCapture
            label="Photo of the estimate · optional"
            hint="Choose, camera, or paste. JPEG on this phone, 4 MB after compress. We do not invent a line from a blurry shot."
            alt="Estimate photo"
            busy={busy}
            image={
              draft.photo
                ? {
                    dataUrl: `data:image/jpeg;base64,${draft.photo.base64}`,
                    base64: draft.photo.base64,
                    mimeType: "image/jpeg",
                    bytes: draft.photo.bytes ?? 0,
                  }
                : null
            }
            onReady={onPhoto}
            onClear={() => patch("photo", null)}
            onError={(message) => setFault(message)}
          />
          {fieldFaults.photo ? (
            <p role="alert" className="mt-2 text-sm text-cone">
              {fieldFaults.photo}
            </p>
          ) : draft.photo ? (
            <p className="mt-2 font-mono text-[11px] text-ticket">
              Ticket photo attached · {(draft.photo.bytes ?? 0) / 1024 > 0 ? `${((draft.photo.bytes ?? 0) / 1024).toFixed(0)} KB` : "JPEG"}
            </p>
          ) : null}
        </div>

        <ChipSet legend="Preferred callback window" error={fieldFaults.window}>
          {CONTACT_WINDOWS.map((row) => (
            <Chip
              key={row.id}
              name="window"
              checked={draft.window === row.id}
              onChange={() => patch("window", row.id as ContactWindow)}
            >
              {row.label}
              <span className="ml-1 opacity-70">{row.hint}</span>
            </Chip>
          ))}
        </ChipSet>

        <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-aluminum">
          <input
            type="checkbox"
            name="consent"
            checked={draft.consent}
            onChange={(event) => patch("consent", event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[var(--ticket)]"
          />
          <span>
            I understand Open Hood does not sell this RO, book a shop, or take a cut of the repair. This is a
            consumer-defense desk, not a marketplace.{" "}
            <BayLink href="/privacy" className="text-ticket hover:text-fluorescent">
              Privacy
            </BayLink>
          </span>
        </label>
        {fieldFaults.consent ? (
          <p role="alert" className="mt-2 text-sm text-cone">
            {fieldFaults.consent}
          </p>
        ) : null}

        <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-aluminum">
          <input
            type="checkbox"
            name="consentToName"
            checked={draft.consentToName}
            onChange={(event) => patch("consentToName", event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[var(--ticket)]"
          />
          <span>
            You may print my name and this note on{" "}
            <BayLink href="/trust" className="text-ticket hover:text-fluorescent">
              /trust
            </BayLink>
            . Leave it off and we print nothing. This box is not a lawyer, not DPPA, and not a counsel stamp.
          </span>
        </label>

        {fault ? (
          <p role="alert" className="mt-3 text-sm leading-6 text-cone">
            {fault}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-sm bg-ticket px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink disabled:opacity-50"
        >
          {busy ? "Stamping…" : "Send the RO"}
        </button>
      </form>

      <aside className="space-y-4">
        <div className="ticket-paper rounded-sm p-5 text-ticket-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Customer copy</p>
          <h3 className="mt-1 font-display text-3xl uppercase leading-none">What happens</h3>
          <div className="contact-perforation my-3 opacity-40" />
          <ol className="space-y-3 text-sm leading-6">
            <li>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">01 · Read</span>
              <p className="mt-0.5">We read the ticket you send. We do not invent a diagnosis or a stock badge.</p>
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">02 · Call</span>
              <p className="mt-0.5">
                {mailer.delivery === "email"
                  ? "This bay has a mailer. The RO goes to the desk, not a list broker."
                  : "No mailer on this bay — Send the RO stamps a ticket you can print. We will not say it emailed a team."}
              </p>
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">03 · Counter</span>
              <p className="mt-0.5">
                Meanwhile: Findings for the printout, Advocate for the next question, Directory for a rooftop. We take
                no cut.
              </p>
            </li>
          </ol>
        </div>

        <div className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Privacy</p>
          <h3 className="mt-1 font-display text-2xl uppercase tracking-wide">We don&apos;t sell the RO</h3>
          <p className="mt-2 text-sm leading-6 text-aluminum">
            No shop network. No lead auction. No &ldquo;partners in your area.&rdquo; A photo compresses on this
            phone ({Math.round(CONTACT_MAX_PHOTO_BYTES / (1024 * 1024))} MB JPEG cap). Local tickets live in{" "}
            <span className="font-mono text-[11px]">.data/</span> on this machine when mailer keys are missing.
          </p>
        </div>
      </aside>
    </div>
  );
}

function SuccessTicket({ result, onAnother }: { result: ContactSubmitResult; onAnother: () => void }) {
  const local = result.delivery === "local";

  return (
    <div className="space-y-4">
      <article className="contact-success ticket-paper print-ticket rounded-sm p-6 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em]">{local ? "Local stamp" : "Desk copy"}</p>
        <h2 className="mt-1 font-display text-4xl uppercase leading-none">Ticket stamped</h2>
        <p className="mt-3 text-sm leading-6">{result.notice}</p>
        <div className="contact-perforation my-4 opacity-50" />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]">{result.summary.title}</p>
        <pre className="mt-3 overflow-x-auto font-mono text-xs leading-6 whitespace-pre-wrap">{result.summary.text}</pre>
      </article>

      <div className="no-print flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm bg-ticket px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ticket-ink"
        >
          Print this copy
        </button>
        <button
          type="button"
          onClick={onAnother}
          className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
        >
          Another RO
        </button>
      </div>

      <nav aria-label="Next desks" className="no-print rounded-sm border border-white/10 bg-bay-2/80 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Still in the bay</p>
        <p className="mt-2 text-sm leading-6 text-aluminum">
          Do not wait on a callback to keep working the ticket. Findings, the advocate, and the directory are open.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {result.nextDesks.map((desk) => (
            <li key={desk.href}>
              <BayLink
                href={desk.href}
                className="inline-block rounded-sm border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum hover:border-ticket/50 hover:text-fluorescent"
              >
                {desk.stamp}
              </BayLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-sm text-cone">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function ChipSet({
  legend,
  error,
  children,
}: {
  legend: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-aluminum">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-cone">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function Chip({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="contact-chip inline-flex cursor-pointer items-center rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
