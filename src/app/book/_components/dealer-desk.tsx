import type { BookDealerLink } from "@/lib/book/types";
import { EXTERNAL_REL } from "@/lib/directory/vehicle-links";
import Link from "next/link";

export function DealerDesk({
  make,
  zip,
  links,
}: {
  make: string;
  zip: string;
  links: BookDealerLink[];
}) {
  const ready = Boolean(make.trim() && zip.trim().length === 5);

  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Dealer locator</p>
      <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">Their locator. Their bay.</h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">
        OEM service URLs by make, with your ZIP on the query when the factory page takes it. Honda opens the locator
        and HondaDealers.com. We do not hold a dealer stall and we do not book one.
      </p>

      {!make.trim() ? (
        <p className="mt-4 text-sm leading-6 text-aluminum">
          Type a make — or{" "}
          <Link href="/" className="text-ticket hover:text-fluorescent">
            identify the car
          </Link>{" "}
          first.
        </p>
      ) : null}

      {make.trim() && zip.trim().length !== 5 ? (
        <p className="mt-4 text-sm leading-6 text-aluminum">ZIP unlocks the locator query.</p>
      ) : null}

      {ready ? (
        <ul className="mt-4 space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel={EXTERNAL_REL}
                className="block rounded-sm border border-white/10 px-3 py-2.5 hover:border-ticket/50"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cone">{link.kind}</span>
                <span className="mt-0.5 block font-display text-xl uppercase leading-none">{link.label}</span>
                <span className="mt-1 block text-sm leading-5 text-aluminum">{link.note}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
