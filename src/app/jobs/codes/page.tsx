import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  redirect(code ? `/jobs/obd?code=${encodeURIComponent(code)}` : "/jobs/obd");
}
