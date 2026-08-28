import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  redirect(code ? `/jobs/obd/${encodeURIComponent(code)}` : "/jobs/obd");
}
