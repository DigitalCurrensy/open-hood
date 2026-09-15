/** Turn "they quoted $89 for a cabin filter" into a line the typical-hour book can flag. */
const JOBS: Array<{ pattern: RegExp; line: string }> = [
  { pattern: /cabin(\s+air)?\s+filter|pollen\s+filter/i, line: "Cabin air filter" },
  { pattern: /fuel\s+(system\s+)?(flush|clean|service)|injector\s+clean/i, line: "Fuel system flush" },
  { pattern: /transmission\s+flush|trans\s+flush/i, line: "Transmission flush" },
  { pattern: /coolant\s+flush|radiator\s+flush/i, line: "Coolant flush" },
  { pattern: /brake\s+fluid\s+flush|brake\s+flush/i, line: "Brake fluid flush" },
  { pattern: /cabin|pollen|micron/i, line: "Cabin filter" },
];

export function spokenQuoteLines(text: string): string {
  const raw = text.replace(/\s+/g, " ").trim();
  if (!raw) return raw;
  const money = raw.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (!money) return raw;
  const job = JOBS.find((row) => row.pattern.test(raw));
  if (!job) return raw;
  const already = new RegExp(`^${job.line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\s+\\$`, "i");
  if (already.test(raw) && raw.length < 80) return raw;
  return `${job.line} $${money[1]}`;
}
