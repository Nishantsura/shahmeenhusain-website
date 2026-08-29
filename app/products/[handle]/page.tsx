import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductBuy } from "@/components/commerce/product-buy";
import {
  ProductGallery,
  ProductGalleryProvider,
  ProductThumbnails,
} from "@/components/commerce/product-gallery";
import { Carousel } from "@/components/sections/carousel";
import { ProductCard } from "@/components/sections/product-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { resolveHandle } from "@/lib/collection-aliases";
import { parseDescription } from "@/lib/product-copy";
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

  const { lead, specs } = parseDescription(
    product.descriptionHtml,
    product.description,
  );

  const related = (await getProducts({ first: 8 }))
    .filter((p) => p.handle !== product.handle)
    .slice(0, 6);

  return (
    <>
      {/* Two full-bleed halves. The image column runs the length of the
          catalogue shoot and scrolls; the buy panel pins beside it. On
          mobile the wrapper goes `contents`, so the title rides above the
          images and the form sits below them — the panel is one component
          on desktop and three stacked blocks on a phone. */}
      <ProductGalleryProvider images={images}>
        <section className="flex flex-col md:grid md:grid-cols-2 md:items-start">
          <div className="order-2 md:order-none md:col-start-1 md:row-start-1">
            <ProductGallery title={product.title} />
          </div>

          <div className="contents md:sticky md:top-0 md:col-start-2 md:row-start-1 md:flex md:min-h-screen md:flex-col md:justify-center md:px-10 md:pt-header md:pb-16 lg:px-16">
            <div className="order-1 px-5 pb-8 pt-[calc(var(--spacing-header)+28px)] md:p-0">
              <div className="flex items-baseline justify-between gap-4">
                <nav className="eyebrow flex gap-2">
                  <Link href="/collections" className="transition-colors hover:text-ink">
                    Collections
                  </Link>
                  {product.productType ? (
                    <>
                      <span aria-hidden>—</span>
                      {/* An unresolved handle falls through to the whole
                          catalogue rather than a dead end — see
                          lib/collection-aliases. */}
                      <Link
                        href={`/collections/${resolveHandle(product.productType)}`}
                        className="transition-colors hover:text-ink"
                      >
                        {product.productType}
                      </Link>
                    </>
                  ) : null}
                </nav>
                {/* Caps at this tracking do not fit beside the breadcrumb on
                    a phone, and it is the least load-bearing thing in the
                    row — the atelier note under the size chips says it. */}
                <span className="eyebrow hidden whitespace-nowrap sm:block">
                  Made in Lucknow
                </span>
              </div>

              <h1 className="statement mt-7 text-[clamp(1.85rem,3.2vw,3rem)]">
                {product.title}
              </h1>

              {lead ? (
                <p className="copy mt-5 max-w-prose text-fine">{lead}</p>
              ) : null}

              <ProductThumbnails className="order-2 mt-7" />
            </div>

            <div className="order-3 px-5 pb-12 md:p-0">
              <ProductBuy product={product} />
            </div>
          </div>
        </section>
      </ProductGalleryProvider>

      <section className="border-t border-rule">
        <div className="container-edge grid gap-8 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-14 md:py-20">
          <h2 className="statement statement-tight md:sticky md:top-28 md:self-start">
            The Piece
            <span aria-hidden className="mt-4 block h-px w-12 bg-gold/60" />
          </h2>

          <Accordion type="single" collapsible defaultValue="p-1">
            {(
              [
                specs.length
                  ? {
                      value: "p-1",
                      label: "Details",
                      content: (
                        <dl className="border-t border-rule">
                          {specs.map((spec) => (
                            <div
                              key={spec.label}
                              /* The accordion item draws its own closing
                                 rule, so the last spec must not draw a
                                 second one 24px above it. */
                              className="grid gap-1 border-b border-rule py-3 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4"
                            >
                              <dt className="label text-ink">{spec.label}</dt>
                              <dd className="text-fine text-ink-soft">{spec.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ),
                    }
                  : lead
                    ? {
                        value: "p-1",
                        label: "Description",
                        content: <p className="copy text-fine">{lead}</p>,
                      }
                    : null,
                {
                  value: "p-2",
                  label: "Size & Fit",
                  content: (
                    <>
                      <p className="copy text-fine">
                        Cut on the house block, with ease allowed over the
                        body measurements in the size guide. Nothing is
                        stocked — every piece is made once you order it, so
                        if none of the standard sizes is right, send us your
                        own measurements from the size guide and we cut to
                        them at no extra cost.
                      </p>
                      <p className="copy text-fine">
                        Model is 5&apos;7&quot; and wears a size S.
                      </p>
                    </>
                  ),
                },
                {
                  value: "p-3",
                  label: "Fabric & Care",
                  content: (
                    <>
                      <p className="copy text-fine">
                        Hand embroidery on natural fibre. Dry clean only, by a
                        specialist familiar with zardosi and chikankari —
                        machine washing lifts the thread and flattens the
                        sequin work.
                      </p>
                      <p className="copy text-fine">
                        Store folded in the muslin bag it arrives in, away
                        from direct light. Press on the reverse, on low heat,
                        never directly over embroidery.
                      </p>
                    </>
                  ),
                },
                {
                  value: "p-4",
                  label: "Shipping & Returns",
                  content: (
                    <>
                      <p className="copy text-fine">
                        Dispatched from Lucknow in three to four weeks;
                        made-to-measure pieces add about a week. Shipping
                        across India is complimentary, and we ship worldwide
                        at cost.
                      </p>
                      <p className="copy text-fine">
                        Standard sizes may be exchanged within seven days of
                        delivery, unworn and with tags intact. Made-to-measure
                        pieces are cut to one person and cannot be exchanged,
                        which is why we call before cutting if a measurement
                        reads unusual.
                      </p>
                    </>
                  ),
                },
              ] as const
            )
              .filter((panel): panel is NonNullable<typeof panel> => panel !== null)
              .map((panel, i) => (
                <Panel
                  key={panel.value}
                  value={panel.value}
                  index={i + 1}
                  label={panel.label}
                >
                  {panel.content}
                </Panel>
              ))}
          </Accordion>
        </div>
      </section>

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

/* The accordion items all take the same shape; naming it keeps the
   editorial section readable as a list of sections rather than as four
   copies of the same three wrappers. The two-digit index in `text-brand`
   is the same "section number" convention craft.tsx uses for its pillars
   — terracotta is reserved for exactly this, per the palette notes in
   app/globals.css, and the accordion had never picked it up. */
function Panel({
  value,
  index,
  label,
  children,
}: {
  value: string;
  index: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border-b border-rule">
      <AccordionTrigger className="py-4 text-ink hover:no-underline">
        <span className="flex items-baseline gap-3">
          <span className="label text-brand">{String(index).padStart(2, "0")}</span>
          <span className="label text-ink">{label}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-5 sm:pl-9 [&>p:not(:last-child)]:mb-3">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
