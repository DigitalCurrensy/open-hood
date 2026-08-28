import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DirectoryBay, directoryFieldsFromSearch } from "@/app/directory/directory-bay";
import { JsonLd } from "@/components/json-ld";
import { DIRECTORY_RESERVED, directoryPathToQuery } from "@/lib/directory/href";
import { breadcrumbList, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return [{ zip: "90210" }, { zip: "43215" }, { zip: "columbus" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zip: string }>;
}): Promise<Metadata> {
  const { zip } = await params;
  const query = directoryPathToQuery(zip);
  return pageMeta({
    title: query ? `Directory · ${query}` : "Directory",
    description: `Rooftops near ${query || "your ZIP"} from OpenStreetMap. We do not book a bay or take a cut.`,
    path: `/directory/${zip}`,
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ zip: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { zip } = await params;
  const decoded = decodeURIComponent(zip).trim();
  if (!decoded || DIRECTORY_RESERVED.has(decoded.toLowerCase())) {
    redirect("/directory");
  }

  const fields = directoryFieldsFromSearch(await searchParams);
  const query = directoryPathToQuery(decoded);

  return (
    <div className="space-y-6">
      <JsonLd
        data={breadcrumbList([
          { name: "Directory", path: "/directory" },
          { name: query || decoded, path: `/directory/${decoded}` },
        ])}
      />
      <DirectoryBay
        query={query}
        type={fields.type}
        year={fields.year}
        make={fields.make}
        model={fields.model}
      />
    </div>
  );
}
