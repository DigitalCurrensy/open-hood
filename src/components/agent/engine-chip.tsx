"use client";

import { useEffect, useState } from "react";

interface AgentStatus {
  engine?: string;
  vision?: boolean;
}

export function EngineChip() {
  const [status, setStatus] = useState<AgentStatus | null>(null);

  useEffect(() => {
    void fetch("/api/agent", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: AgentStatus) => setStatus(payload))
      .catch(() => setStatus({ engine: "rules", vision: false }));
  }, []);

  if (!status) {
    return <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">Checking Ask…</p>;
  }

  const live = status.engine !== "rules";
  return (
    <p className={`font-mono text-[10px] uppercase tracking-[0.22em] ${live ? "text-ticket" : "text-cone"}`}>
      {live
        ? `Ask live · ${status.engine}${status.vision ? " · photos on" : ""}`
        : "Ask is typed tools only — this deploy does not see OPENAI_API_KEY"}
    </p>
  );
}
