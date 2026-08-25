import type { AgentTool } from "@/lib/agent/types";
import type { Route } from "next";
import Link from "next/link";

export function ToolTickets({ tools }: { tools: AgentTool[] }) {
  if (!tools.length) return null;

  return (
    <div className="mt-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-aluminum">Next desk</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href as Route}
              className="ticket-paper block rounded-sm px-3 py-2.5 text-ticket-ink transition-transform hover:-translate-y-0.5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">{tool.stamp}</p>
              <p className="font-display text-xl uppercase leading-none">{tool.title}</p>
              <p className="mt-1 text-sm leading-5">{tool.reason}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
