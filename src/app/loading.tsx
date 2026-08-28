import { BayTicketBar } from "@/components/bay-recovery-nav";

/** Thin strip only. A full-page spinner was “Opening bay…” forever on slow desks. */
export default function Loading() {
  return <BayTicketBar />;
}
