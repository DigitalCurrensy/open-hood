/** Empty / short ZIP copy. 90210 and 43215 stay sample desks — only if asked. No wrong-city fill. */
export function emptyZipMessage(query = ""): string | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return "Type a five-digit US ZIP or a city. Cached sample maps (90210, 43215) only appear when you ask for those desks — we will not drop Beverly Hills on an empty box.";
  }
  if (/^\d{1,4}$/.test(trimmed)) {
    return `“${trimmed}” is not a five-digit ZIP. Type all five. Sample maps stay on 90210 and 43215 — only if you open those desks.`;
  }
  return null;
}

export const EMPTY_ZIP_HINT = emptyZipMessage("") ?? "";
