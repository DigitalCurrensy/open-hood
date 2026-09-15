"use client";

import { useEffect, useState } from "react";

interface AgentStatus {
  engine?: string;
  vision?: boolean;
  keyOn?: boolean;
  note?: string;
}

export function EngineChip() {
  const [status, setStatus] = useState<AgentStatus | null>(null);

  useEffect(() => {
    void fetch("/api/agent", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: AgentStatus) => setStatus(payload))
      .catch(() => setStatus({ engine: "rules", vision: false, keyOn: false }));
  }, []);

  if (!status) {
    return <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-aluminum">Checking Ask…</p>;
  }

  if (status.keyOn) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ticket" title={status.note}>
        Key on · typed tools until a model call returns 200
      </p>
    );
  }

  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cone">
      Ask is typed tools only — this deploy does not see OPENAI_API_KEY
    </p>
  );
}
