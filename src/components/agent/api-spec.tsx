"use client";

import { useEffect, useState } from "react";

interface ToolHelp {
  [name: string]: string;
}

interface SpecOp {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  "x-openhood-fetch"?: string;
}

interface SpecJson {
  info?: { title?: string; version?: string; description?: string; summary?: string };
  paths?: Record<string, Record<string, SpecOp>>;
  components?: { schemas?: Record<string, unknown> };
  "x-openhood-tools"?: ToolHelp;
}

export function AgentApiSpec() {
  const [spec, setSpec] = useState<SpecJson | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/openapi?format=json")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load the spec.");
        return (await response.json()) as SpecJson;
      })
      .then((json) => {
        if (!cancelled) setSpec(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the spec.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm text-cone">{error}</p>;
  if (!spec) {
    return <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-aluminum">Loading the contract…</p>;
  }

  const paths = Object.entries(spec.paths ?? {});
  const tools = Object.entries(spec["x-openhood-tools"] ?? {});

  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-aluminum">{spec.info?.description ?? spec.info?.summary}</p>

      <section className="rounded-sm border border-white/10 bg-bay-2/80 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Tools the advocate uses</p>
        <ul className="mt-3 space-y-2">
          {tools.map(([name, help]) => (
            <li key={name} className="text-sm leading-6 text-fluorescent">
              <span className="font-mono text-ticket">{name}</span>
              <span className="text-aluminum"> — {help}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Paths</p>
        {paths.map(([path, methods]) =>
          Object.entries(methods).map(([method, op]) => (
            <article key={`${method}-${path}`} className="rounded-sm border border-white/10 bg-bay/50 px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ticket">
                {method} {path}
              </p>
              <p className="mt-1 font-display text-2xl uppercase text-fluorescent">{op.summary}</p>
              {op.description ? <p className="mt-2 text-sm leading-6 text-aluminum">{op.description}</p> : null}
              {op["x-openhood-fetch"] ? (
                <pre className="mt-3 overflow-x-auto rounded-sm border border-white/10 bg-bay px-3 py-2 font-mono text-[11px] leading-5 text-fluorescent">
                  {op["x-openhood-fetch"]}
                </pre>
              ) : null}
            </article>
          )),
        )}
      </section>
    </div>
  );
}
