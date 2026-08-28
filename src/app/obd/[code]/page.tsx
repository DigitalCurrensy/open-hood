import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const stamp = decodeURIComponent(code).trim();
  redirect(stamp ? `/obd?code=${encodeURIComponent(stamp)}` : "/obd");
}
