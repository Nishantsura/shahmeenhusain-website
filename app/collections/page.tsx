import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CollectionIndex } from "@/components/sections/collection-index";
import { PageHead } from "@/components/sections/page-head";
import { handleFromParams } from "@/lib/collection-aliases";
import { getCollectionsIndex } from "@/lib/shopify";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse the Shahmeen Husain collections — bridal lehengas, luxury pret, chikankari, sarees and occasion couture.",
};

/**
 * The collections index.
 *
 * This route used to render the whole catalogue as one product grid,
 * which left the nav with two links meaning the same thing. Shop-all now
 * lives at /collections/all — an unresolved handle falls through to the
 * full catalogue by design — and this page lists the lines instead.
 */
export default async function CollectionsPage({
  searchParams,
}: PageProps<"/collections">) {
  // Legacy links still arrive as ?cat= / ?sil= / ?collection=. They used
  // to be resolved and rendered here; now they get sent to the canonical
  // collection URL rather than silently rendering under a generic one.
  const params = await searchParams;
  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const handle = handleFromParams({
    collection: pick(params.collection),
    cat: pick(params.cat),
    sil: pick(params.sil),
  });

  if (handle) redirect(`/collections/${handle}`);

  const collections = await getCollectionsIndex();

  return (
    <>
      <PageHead eyebrow="Shop" index="Collections" title="The Collections" />
      <CollectionIndex collections={collections} />
    </>
  );
}
