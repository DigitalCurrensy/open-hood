import { BOOK_SHOP_VENDORS, BOOK_VENDOR_LINE } from "@/lib/book/vendors";
import { EXTERNAL_REL } from "@/lib/directory/vehicle-links";

export function VendorBay() {
  return (
    <section className="rounded-sm border border-white/10 bg-bay-2/80 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">For shops · B2B</p>
      <h2 className="mt-1 font-display text-2xl uppercase tracking-wide">A real OS. Not this bay.</h2>
      <p className="mt-2 text-sm leading-6 text-aluminum">{BOOK_VENDOR_LINE}</p>

      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {BOOK_SHOP_VENDORS.map((vendor) => (
          <li key={vendor.id} className="rounded-sm border border-white/10 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cone">
              {vendor.stamp} · {vendor.for}
            </p>
            <h3 className="mt-1 font-display text-2xl uppercase leading-none">{vendor.name}</h3>
            <p className="mt-2 text-sm leading-6 text-aluminum">{vendor.body}</p>
            <a
              href={vendor.href}
              target="_blank"
              rel={EXTERNAL_REL}
              className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-ticket hover:text-fluorescent"
            >
              Open {vendor.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
