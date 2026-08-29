import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/shopify/types";

export function ProductCard({
  product,
  sizes = "(max-width: 768px) 60vw, 300px",
  priority = false,
}: {
  product: Product;
  sizes?: string;
  priority?: boolean;
}) {
  const sizeOption = product.options.find((o) => /size/i.test(o.name));

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden bg-paper-deep">
        {product.featuredImage?.url ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-mute">
            {product.title}
          </div>
        )}
        <span className="label absolute inset-x-0 bottom-0 translate-y-full bg-ink/85 py-3 text-center text-paper opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          Quick Shop
        </span>
      </div>

      <div className="pt-4">
        <h3 className="font-serif text-lg leading-snug text-ink">
          {product.title}
        </h3>
        <p className="mt-1 flex items-baseline gap-2 text-sm text-ink-soft">
          {formatMoney(product.price)}
          {product.compareAtPrice ? (
            <span className="text-xs text-ink-mute line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          ) : null}
        </p>
        {sizeOption ? (
          <p className="eyebrow mt-2 flex flex-wrap gap-1.5 text-[0.625rem] tracking-caps">
            {sizeOption.values.map((v) => (
              <span key={v} className="border border-rule px-1.5 py-0.5">
                {v}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
