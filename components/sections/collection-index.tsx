import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import type { CollectionCard } from "@/lib/shopify";

/**
 * The collections index — the store's named lines, not its products.
 *
 * Cards carry a numeral rather than a description: most of these
 * collections have no description set in Shopify, and a grid where half
 * the cards have body copy and half do not looks broken.
 */
export function CollectionIndex({ collections }: { collections: CollectionCard[] }) {
  if (!collections.length) return null;

  return (
    <section className="gutter pb-(--space-section)">
      <div className="grid gap-x-[clamp(1rem,2.2vw,2.2rem)] gap-y-[clamp(2.5rem,5vw,4.5rem)] sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, i) => (
          <Reveal key={collection.id} kind="rise" delay={(i % 3) * 0.06}>
            <Link href={`/collections/${collection.handle}`} className="group block">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper-deep">
                {collection.cover ? (
                  <Image
                    src={collection.cover.url}
                    alt={collection.cover.altText ?? collection.title}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                ) : null}
              </div>

              <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-rule pt-4">
                <h2 className="statement statement-tight text-[clamp(1.35rem,2vw,1.85rem)] transition-colors group-hover:text-brand">
                  {collection.title}
                </h2>
                <span className="shrink-0 font-body text-fine tabular-nums tracking-caps text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
