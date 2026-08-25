import type { Metadata } from "next";
import { QuotePage } from "@/components/pages/quote-page";

export const metadata: Metadata = {
  title: "Quote defense",
  description: "Mark up a repair order and get the sentences to say at the counter.",
};

export default function Page() {
  return <QuotePage />;
}
