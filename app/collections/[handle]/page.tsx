import type { Metadata } from "next";

import { CollectionGrid } from "@/components/sections/collection-grid";
import { PageHead } from "@/components/sections/page-head";
import { resolveHandle } from "@/lib/collection-aliases";
import { getCollectionOrAll, getCollectionProducts, getCollections } from "@/lib/shopify";

export const revalidate = 3600;

export async function generateStaticParams() {
  const collections = await getCollections({ first: 30 });
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  try {
    const col = await getCollectionProducts(resolveHandle(handle)!, { first: 1 });
    if (col) {
      return {
        title: col.title,
        description: col.description || `${col.title} by Shahmeen Husain.`,
      };
    }
  } catch {
    // fall through to the default
  }
  return { title: "Collections" };
}

export default async function CollectionPage({
  params,
}: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const { title, products } = await getCollectionOrAll(resolveHandle(handle), {
    first: 48,
  });

  return (
    <>
      {/* A null title means the handle did not resolve and we fell back
          to the whole catalogue — which is exactly what /collections/all
          is. "All Collections" would now read as the index page. */}
      <PageHead eyebrow="Collection" title={title ?? "Shop All"} />
      <CollectionGrid products={products} />
    </>
  );
}
