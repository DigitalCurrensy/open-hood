import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cone">Customer copy</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-aluminum">{BRAND.description}</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <li>
            <Link href="/how-it-works" className="hover:text-ticket">
              How it works
            </Link>
          </li>
          <li>
            <Link href="/mechanic-mode" className="hover:text-ticket">
              Counter script
            </Link>
          </li>
          <li>
            <Link href="/directory" className="hover:text-ticket">
              Directory
            </Link>
          </li>
          <li>
            <Link href="/guides" className="hover:text-ticket">
              Guides
            </Link>
          </li>
          <li>
            <Link href="/agent" className="hover:text-ticket">
              Advocate
            </Link>
          </li>
          <li>
            <Link href="/expert" className="hover:text-ticket">
              Expert
            </Link>
          </li>
          <li>
            <Link href="/jobs" className="hover:text-ticket">
              Jobs
            </Link>
          </li>
          <li>
            <Link href="/log" className="hover:text-ticket">
              Service log
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-ticket">
              Talk to Open Hood
            </Link>
          </li>
          <li>
            <Link href="/shops" className="hover:text-ticket">
              Find shops
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-ticket">
              Terms
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="hover:text-ticket">
              Privacy
            </Link>
          </li>
          <li>
            <a href="https://www.nhtsa.gov/recalls" className="hover:text-ticket" rel="noreferrer">
              NHTSA recalls
            </a>
          </li>
        </ul>
      </div>
      <nav aria-label="For crawlers" className="mx-auto max-w-6xl border-t border-white/5 px-4 py-4 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cone">For crawlers</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-aluminum">
          <li>
            <a href="/llms.txt" className="hover:text-ticket">
              llms.txt
            </a>
          </li>
          <li>
            <a href="/openapi.yaml" className="hover:text-ticket">
              OpenAPI
            </a>
          </li>
          <li>
            <a href="/sitemap.xml" className="hover:text-ticket">
              sitemap.xml
            </a>
          </li>
          <li>
            <a href="/robots.txt" className="hover:text-ticket">
              robots.txt
            </a>
          </li>
          <li>
            <Link href="/terms" className="hover:text-ticket">
              Terms
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="hover:text-ticket">
              Privacy
            </Link>
          </li>
          <li>
            <a href="/humans.txt" className="hover:text-ticket">
              humans.txt
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
