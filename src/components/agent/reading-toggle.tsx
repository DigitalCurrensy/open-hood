"use client";

import { useReadingLevel } from "@/components/reading-level";

export function AgentReadingToggle() {
  const [level, setLevel] = useReadingLevel();

  return (
    <div role="group" aria-label="Reading level" className="inline-flex rounded-sm border border-white/15">
      {(
        [
          { id: "beginner" as const, label: "Beginner", hint: "Short steps. What to say at the counter." },
          { id: "expert" as const, label: "Expert", hint: "Codes, millimeters, OEM vs aftermarket, freeze-frame." },
        ] as const
      ).map((option) => {
        const active = level === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            title={option.hint}
            onClick={() => setLevel(option.id)}
            className={`px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] ${
              active ? "bg-ticket text-ticket-ink" : "text-aluminum hover:text-fluorescent"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
