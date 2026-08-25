import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function Page() {
  redirect("/how-it-works");
}
