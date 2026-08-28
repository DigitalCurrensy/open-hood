export type BayDtcEntry = {
  title: string;
  layperson: string;
  doNotThrowParts: string;
  firstLook: string;
  severity?: string;
};

export type BayDtcResult = {
  code: string;
  valid: boolean;
  error?: string;
  entry: BayDtcEntry | null;
  generic: { system: string; hint: string; doNotThrowParts?: string } | null;
  count?: number;
};

function trimOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

/** Same Next route the jobs OBD desk already POSTs. */
export async function postStoredDtc(origin: string, code: string): Promise<BayDtcResult> {
  const bay = trimOrigin(origin);
  if (!bay) throw new Error("Set the bay origin — same host as the Next website.");

  let response: Response;
  try {
    response = await fetch(`${bay}/api/jobs/dtc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ code }),
    });
  } catch {
    throw new Error(
      "Bay origin unreachable. On a phone use your LAN IP, not localhost. Start Next with npm run dev.",
    );
  }

  const body = (await response.json()) as BayDtcResult & { error?: string };
  if (!response.ok) {
    throw new Error(body.error || `Bay returned ${response.status}.`);
  }
  return body;
}

export function quoteHref(origin: string, code: string): string {
  const stamp = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `${trimOrigin(origin)}/quote?code=${encodeURIComponent(stamp)}`;
}

export function jobsObdHref(origin: string, code: string): string {
  const stamp = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `${trimOrigin(origin)}/jobs/obd?code=${encodeURIComponent(stamp)}`;
}
