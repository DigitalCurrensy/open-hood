import { EXTERNAL_REL } from "@/lib/finder/links";
import type { FinderRetailerLink } from "@/lib/finder/types";

export function RetailerStamps({
  retailers,
  hold,
}: {
  retailers: FinderRetailerLink[];
  hold?: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {retailers.map((store) => (
        <li key={store.id}>
          <a
            href={store.href}
            target="_blank"
            rel={EXTERNAL_REL}
            data-hold={hold ? "true" : "false"}
            className="finder-retailer"
            title={store.note}
          >
            {store.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
