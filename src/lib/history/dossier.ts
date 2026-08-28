import { fetchComplaintSummary, fetchSafetyRatings } from "@/lib/directory/nhtsa-safety";
import { decodeVin, fetchRecallBundle } from "@/lib/nhtsa";
import { isValidVin, normalizeVin } from "@/lib/vin";
import { buildLinkOut } from "@/lib/history/links";
import { decoderOptions, optionsNote, vehicleHeadline } from "@/lib/history/options";
import { HISTORY_SOURCE_LEDGER, TITLE_BRAND_INTRO, TITLE_BRAND_ROWS } from "@/lib/history/title";
import { eventsFromRecalls } from "@/lib/history/timeline";
import { HistoryError, type HistoryDossier } from "@/lib/history/types";

const DISCLAIMER =
  "NHTSA identity, nameplate campaigns, complaints, and stars. Not a title brand. Not an accident file. We do not invent wrecks.";

export function requireVin(raw: string | undefined): string {
  const vin = normalizeVin(raw ?? "");
  if (!isValidVin(vin)) {
    throw new HistoryError("Enter a 17-character VIN. Letters I, O, and Q are never used.");
  }
  return vin;
}

export async function assembleDossier(rawVin: string): Promise<HistoryDossier> {
  const vin = requireVin(rawVin);
  let identity;
  try {
    identity = await decodeVin(vin);
  } catch (error) {
    throw new HistoryError(error instanceof Error ? error.message : "NHTSA vPIC could not decode that VIN.", 502);
  }

  const year = identity.year;
  const make = identity.make;
  const model = identity.model;

  const [bundle, complaints, ncap] = await Promise.all([
    fetchRecallBundle(identity),
    fetchComplaintSummary(year, make, model),
    fetchSafetyRatings(year, make, model),
  ]);
  const recalls = bundle.rows;

  const options = decoderOptions(identity);

  return {
    ok: true,
    vin,
    headline: vehicleHeadline(identity),
    disclaimer: DISCLAIMER,
    live: {
      identity,
      options,
      optionsNote: optionsNote(options),
      recalls,
      complaints,
      ncap,
      nhtsaEvents: eventsFromRecalls(recalls),
    },
    linkOut: buildLinkOut(vin),
    titleBrand: {
      intro: TITLE_BRAND_INTRO,
      rows: TITLE_BRAND_ROWS,
    },
    sources: HISTORY_SOURCE_LEDGER,
    pulledAt: new Date().toISOString(),
  };
}
