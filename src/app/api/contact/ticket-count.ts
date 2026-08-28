import { readFile } from "node:fs/promises";
import { contactStorePath } from "@/lib/contact";

/**
 * Honest count: non-empty lines in the gitignored jsonl.
 * Does not parse rows. Never returns names, phones, emails, VINs, photos, or quotes.
 */
export async function countTicketsOnThisBay(): Promise<number> {
  try {
    const raw = await readFile(contactStorePath(), "utf8");
    let count = 0;
    for (const line of raw.split("\n")) {
      if (line.trim()) count += 1;
    }
    return count;
  } catch {
    return 0;
  }
}
