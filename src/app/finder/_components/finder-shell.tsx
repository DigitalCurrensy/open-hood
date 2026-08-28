import type { ReactNode } from "react";
import { Suspense } from "react";
import { FinderBoard } from "@/app/finder/_components/finder-board";
import "../finder.css";

export function FinderShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">Stamping the aisle…</p>
        }
      >
        <FinderBoard />
      </Suspense>
      {children}
    </div>
  );
}
