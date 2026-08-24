import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductBuy } from "@/components/commerce/product-buy";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { Carousel } from "@/components/sections/carousel";
import { ProductCard } from "@/components/sections/product-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProduct, getProducts } from "@/lib/shopify";

export const revalidate = 3600;

/* Prerender the catalogue at build time; anything new is rendered on
   first request and then cached (dynamicParams defaults to true). */
export async function generateStaticParams() {
  const products = await getProducts({ first: 48 });
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product" };

  return {
    title: product.title,
    description:
      product.description?.slice(0, 160) ||
      `${product.title} — handcrafted by Shahmeen Husain.`,
    openGraph: {
      title: product.title,
      images: product.featuredImage?.url ? [product.featuredImage.url] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const images = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  const related = (await getProducts({ first: 8 }))
    .filter((p) => p.handle !== product.handle)
    .slice(0, 6);

  return (
    <>
      <div className="container-edge pt-[calc(72px+40px)]">
        <nav className="flex gap-2 text-label uppercase tracking-[0.14em] text-ink-mute">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/collections" className="transition-colors hover:text-ink">
            Collections
          </Link>
          <span>/</span>
          <span className="text-ink">{product.title}</span>
        </nav>
      </div>

      <div className="container-edge grid gap-12 py-10 md:grid-cols-2 md:items-start md:gap-16">
        {/* Both columns are sticky: whichever is shorter at the current
            viewport pins while the taller one scrolls past it. Which one
            that is flips with viewport width, so it is not hard-coded. */}
        <div className="md:sticky md:top-24">
          <ProductGallery images={images} title={product.title} />
        </div>

        <div className="md:sticky md:top-24">
          <h1 className="mb-5 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-light leading-tight text-ink">
            {product.title}
          </h1>

          <ProductBuy product={product} />

          {product.descriptionHtml ? (
            <Accordion type="single" collapsible className="mt-10">
              <AccordionItem value="description" className="border-rule">
                <AccordionTrigger className="text-label uppercase tracking-[0.18em] hover:no-underline">
                  Description
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose-sm text-[0.875rem] leading-[1.85] text-ink-soft [&_a]:underline [&_li]:mb-1 [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="border-t border-rule py-20">
          <div className="container-edge mb-10">
            <h2 className="statement statement-tight">You May Also Like</h2>
          </div>
          <Carousel>
            {related.map((p) => (
              <div
                key={p.id}
                data-card
                className="w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-[23vw]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </Carousel>
        </section>
      ) : null}
    </>
  );
}
