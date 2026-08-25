import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-cone">{kicker}</p>
        <h1 className="font-display text-4xl uppercase leading-none tracking-wide text-fluorescent sm:text-5xl">
          {title}
        </h1>
      </div>
      {children ? <div className="max-w-md text-sm leading-6 text-aluminum">{children}</div> : null}
    </div>
  );
}
