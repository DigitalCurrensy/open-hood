export const TERMS_ROUTE = "/terms" as const;
export const PRIVACY_ROUTE = "/privacy" as const;

/** One altitude, one date. Move this when either page changes. */
export const LEGAL_EFFECTIVE = "27 August 2026" as const;

/** Dated honesty line. Not a counsel-approved hologram. */
export const COUNSEL_REVIEW_LINE =
  "Awaiting outside review · 27 August 2026. A checkbox is not a lawyer. Counsel has not signed plate-to-VIN, DPPA, live charges, or a courtroom venue." as const;

export const LEGAL_SITEMAP_PATHS = [TERMS_ROUTE, PRIVACY_ROUTE] as const;
