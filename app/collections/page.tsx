import type { Metadata } from "next";

import { CollectionGrid } from "@/components/sections/collection-grid";
import { PageHead } from "@/components/sections/page-head";
import { handleFromParams } from "@/lib/collection-aliases";
import { getCollectionOrAll } from "@/lib/shopify";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse handcrafted lehengas, sarees, gowns and occasion couture by Shahmeen Husain.",
};

export default async function CollectionsPage({
  searchParams,
}: PageProps<"/collections">) {
  // Legacy links still arrive as ?cat= / ?sil= / ?collection=
  const params = await searchParams;
  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const handle = handleFromParams({
    collection: pick(params.collection),
    cat: pick(params.cat),
    sil: pick(params.sil),
  });

  const { title, products } = await getCollectionOrAll(handle, { first: 48 });

  return (
    <>
      <PageHead eyebrow="Shop" index="Collections" title={title ?? "All Collections"} />
      <CollectionGrid products={products} />
    </>
  );
}
