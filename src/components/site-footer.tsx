import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cone">Customer copy</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-aluminum">{BRAND.description}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-aluminum">
            Live demo · https://open-hood.vercel.app
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <li><Link href="/how-it-works" className="hover:text-ticket">How it works</Link></li>
          <li><Link href="/mechanic-mode" className="hover:text-ticket">What to say</Link></li>
          <li><Link href="/quote" className="hover:text-ticket">This estimate</Link></li>
          <li><Link href="/agent" className="hover:text-ticket">Ask</Link></li>
          <li><Link href="/directory" className="hover:text-ticket">Shops</Link></li>
          <li><Link href="/contact" className="hover:text-ticket">Contact</Link></li>
          <li><Link href="/terms" className="hover:text-ticket">Terms</Link></li>
          <li><Link href="/privacy" className="hover:text-ticket">Privacy</Link></li>
        </ul>
      </div>
    </footer>
  );
}
