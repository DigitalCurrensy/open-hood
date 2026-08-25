import type { AgentTool } from "@/lib/agent/types";

export const AGENT_TOOL_BOOK: Record<AgentTool["href"], AgentTool> = {
  "/quote": {
    href: "/quote",
    stamp: "Quote",
    title: "Quote defense",
    reason: "Paste or photo the RO. We grease-pencil padded lines.",
  },
  "/symptoms": {
    href: "/symptoms",
    stamp: "Noise",
    title: "Symptom wizard",
    reason: "Map the sound and the moment to shop questions.",
  },
  "/guides": {
    href: "/guides",
    stamp: "Guide",
    title: "Guides",
    reason: "DIY vs shop, and what a 'flush' actually is.",
  },
  "/directory": {
    href: "/directory",
    stamp: "Shops",
    title: "Directory",
    reason: "Find a shop. We do not book or take a cut.",
  },
  "/obd": {
    href: "/obd",
    stamp: "OBD",
    title: "OBD codes",
    reason: "Type the scanner code. No dongle required.",
  },
};

export function pickTools(...hrefs: AgentTool["href"][]): AgentTool[] {
  const seen = new Set<AgentTool["href"]>();
  const tools: AgentTool[] = [];
  for (const href of hrefs) {
    if (seen.has(href)) continue;
    seen.add(href);
    tools.push(AGENT_TOOL_BOOK[href]);
  }
  return tools;
}

export const QUICK_PROMPTS = [
  { label: "They quoted a flush", text: "They quoted a flush" },
  { label: "Squeal when braking", text: "Squeal when braking" },
  { label: "Check engine P0420", text: "Check engine P0420" },
  { label: "Is this a dealer-only job?", text: "Is this a dealer-only job?" },
] as const;
