const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function trustClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "local";
  return ip.slice(0, 80);
}

export function takeHoldSlot(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (current.count >= MAX_HITS) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true };
}

function prune(now: number) {
  if (buckets.size < 200) return;
  for (const [id, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(id);
  }
}
