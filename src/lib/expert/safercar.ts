import { fetchComplaintSummary } from "@/lib/directory/nhtsa-safety";
import { SAFERCAR_RECALLS } from "@/lib/expert/tsb";
import type { SaferCarLookup } from "@/lib/expert/types";
import { fetchRecalls, specsFromYearMakeModel } from "@/lib/nhtsa";

export async function lookupSaferCar(year: string, make: string, model: string): Promise<SaferCarLookup> {
  const y = year.trim();
  const mk = make.trim();
  const md = model.trim();
  const specs = specsFromYearMakeModel({ year: y, make: mk, model: md });
  const [recalls, complaints] = await Promise.all([fetchRecalls(specs), fetchComplaintSummary(y, mk, md)]);

  return {
    year: y,
    make: mk,
    model: md,
    recallCount: recalls.length,
    recalls: recalls.slice(0, 12).map((row) => ({
      campaignNumber: row.campaignNumber,
      component: row.component,
      summary: row.summary,
      consequence: row.consequence,
      remedy: row.remedy,
    })),
    complaints,
    saferCarUrl: SAFERCAR_RECALLS,
    vinLookupUrl: SAFERCAR_RECALLS,
    disclaimer:
      "Official NHTSA SaferCar campaigns and complaint counts. Not a Carfax, not a stolen TSB, not legal advice. A VIN lookup on nhtsa.gov/recalls is the close-out.",
  };
}
