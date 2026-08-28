import { PWA_UNLOCK_INLINE } from "@/lib/pwa-unlock-script";

/** Head, first paint. Dead :3100 → :3000 now. Leftover offline paint leaves once. `/?unlock=1` is backup. */
export function PwaUnlockScript() {
  return <script id="openhood-unlock" dangerouslySetInnerHTML={{ __html: PWA_UNLOCK_INLINE }} />;
}
