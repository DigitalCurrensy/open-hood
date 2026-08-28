import type { Metadata } from "next";
import { DirectoryBay, directoryFieldsFromSearch } from "@/app/directory/directory-bay";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Directory",
  description:
    "Dealers, independents, parts, tires, body, towing, and washes near a ZIP from OpenStreetMap. We do not book a bay or take a cut.",
  path: "/directory",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const fields = directoryFieldsFromSearch(await searchParams);
  return (
    <DirectoryBay
      query={fields.query}
      type={fields.type}
      year={fields.year}
      make={fields.make}
      model={fields.model}
    />
  );
}
