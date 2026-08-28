import {
  BOOK_JOBS,
  BOOK_VENUES,
  BOOK_WINDOWS,
  type BookDraft,
  type BookJob,
  type BookVenue,
  type BookWindow,
} from "@/lib/book/types";
import type { FormEvent, ReactNode } from "react";

const FIELD =
  "mt-1.5 w-full rounded-sm border border-white/15 bg-bay px-3 py-2 text-sm text-fluorescent placeholder:text-aluminum/40";

export function VisitForm({
  draft,
  expert,
  busy,
  fault,
  fieldFaults,
  mailerHint,
  onPatch,
  onSubmit,
}: {
  draft: BookDraft;
  expert: boolean;
  busy: boolean;
  fault: string;
  fieldFaults: Partial<Record<keyof BookDraft, string>>;
  mailerHint: string;
  onPatch: <K extends keyof BookDraft>(key: K, value: BookDraft[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="book-carbon book-void rounded-sm border border-white/10 p-5" onSubmit={onSubmit} noValidate>
      <p className="book-void-stamp">No mechanic</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">
        {expert ? "Job · ZIP · venue · VIN" : "Job · ZIP · window"}
      </p>
      <h2 className="mt-1 max-w-[14ch] font-display text-3xl uppercase tracking-wide">Visit note</h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        {expert
          ? "Venue is shop, mobile, or dealer as a note on the shortlist. Mobile is not a van we send. YourMechanic does that. We stamp paper."
          : "Job, ZIP, the car, and a window. This is a visit note for your shortlist. We do not book a bay or open a checkout."}
      </p>

      <ChipSet legend="The job" error={fieldFaults.job}>
        {BOOK_JOBS.map((job) => (
          <Chip key={job.id} name="job" checked={draft.job === job.id} onChange={() => onPatch("job", job.id as BookJob)}>
            {job.label}
          </Chip>
        ))}
      </ChipSet>

      <Field label="ZIP" error={fieldFaults.zip} className="mt-4">
        <input
          required
          name="zip"
          inputMode="numeric"
          autoComplete="postal-code"
          value={draft.zip}
          onChange={(event) => onPatch("zip", event.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="90210"
          className={`${FIELD} font-mono`}
        />
      </Field>

      <ChipSet legend="Shop, mobile, or dealer" error={fieldFaults.venue}>
        {BOOK_VENUES.map((venue) => (
          <Chip
            key={venue.id}
            name="venue"
            checked={draft.venue === venue.id}
            onChange={() => onPatch("venue", venue.id as BookVenue)}
          >
            {venue.label}
            <span className="ml-1 opacity-70">{venue.hint}</span>
          </Chip>
        ))}
      </ChipSet>

      {draft.venue === "mobile" ? (
        <p className="mt-3 text-sm leading-6 text-cone">
          Mobile means you want a van. YourMechanic, Wrench, and RepairSmith send people. We do not. This ticket only
          stores the ask.
        </p>
      ) : null}

      <ChipSet legend="Preferred window" error={fieldFaults.window}>
        {BOOK_WINDOWS.map((row) => (
          <Chip
            key={row.id}
            name="window"
            checked={draft.window === row.id}
            onChange={() => onPatch("window", row.id as BookWindow)}
          >
            {row.label}
            <span className="ml-1 opacity-70">{row.hint}</span>
          </Chip>
        ))}
      </ChipSet>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Name" error={fieldFaults.name}>
          <input
            required
            name="name"
            autoComplete="name"
            value={draft.name}
            onChange={(event) => onPatch("name", event.target.value)}
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
            onChange={(event) => onPatch("phone", event.target.value)}
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
          onChange={(event) => onPatch("email", event.target.value)}
          placeholder="you@example.com"
          className={FIELD}
        />
      </Field>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum">
        Name plus a phone or an email
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label="Year" error={fieldFaults.year}>
          <input
            name="year"
            inputMode="numeric"
            autoComplete="off"
            value={draft.year}
            onChange={(event) => onPatch("year", event.target.value)}
            placeholder="2013"
            className={FIELD}
          />
        </Field>
        <Field label="Make" error={fieldFaults.make}>
          <input
            name="make"
            value={draft.make}
            onChange={(event) => onPatch("make", event.target.value)}
            placeholder="Honda"
            className={FIELD}
          />
        </Field>
        <Field label="Model" error={fieldFaults.model}>
          <input
            name="model"
            value={draft.model}
            onChange={(event) => onPatch("model", event.target.value)}
            placeholder="Civic"
            className={FIELD}
          />
        </Field>
      </div>

      {expert ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="VIN · optional" error={fieldFaults.vin}>
            <input
              name="vin"
              autoComplete="off"
              spellCheck={false}
              value={draft.vin}
              onChange={(event) => onPatch("vin", event.target.value.toUpperCase())}
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
              onChange={(event) => onPatch("mileage", event.target.value)}
              placeholder="48210"
              className={FIELD}
            />
          </Field>
        </div>
      ) : (
        <Field label="VIN · optional" error={fieldFaults.vin} className="mt-3">
          <input
            name="vin"
            autoComplete="off"
            spellCheck={false}
            value={draft.vin}
            onChange={(event) => onPatch("vin", event.target.value.toUpperCase())}
            placeholder="17 characters"
            className={`${FIELD} vin-cell font-mono`}
          />
        </Field>
      )}

      <Field label="Notes" error={fieldFaults.notes} className="mt-4">
        <textarea
          name="notes"
          rows={expert ? 5 : 3}
          value={draft.notes}
          onChange={(event) => onPatch("notes", event.target.value)}
          placeholder={draft.job === "other" ? "What should they look at?" : "Noise, light, or what they already quoted."}
          className={FIELD}
        />
      </Field>

      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-aluminum">
        <input
          type="checkbox"
          name="consent"
          checked={draft.consent}
          onChange={(event) => onPatch("consent", event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[var(--ticket)]"
        />
        <span>
          I understand Open Hood does not employ technicians, book a stall, or take a cut. This is a visit note —
          a shortlist stamp, not a dispatch.
        </span>
      </label>
      {fieldFaults.consent ? (
        <p role="alert" className="mt-2 text-sm text-cone">
          {fieldFaults.consent}
        </p>
      ) : null}

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-aluminum">{mailerHint}</p>

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
        {busy ? "Stamping…" : "Stamp the shortlist"}
      </button>
    </form>
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
    <label className="book-chip inline-flex cursor-pointer items-center rounded-sm px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-aluminum">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
