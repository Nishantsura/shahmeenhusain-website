/* ============================================
   Shopify Storefront — normalised domain types
   --------------------------------------------
   The legacy client returned raw GraphQL shapes for products (with
   nested `edges`) but normalised carts, so callers had to know which
   was which. Everything is normalised uniformly here.
   ============================================ */

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopImage = {
  url: string;
  altText: string | null;
  width?: number | null;
  height?: number | null;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  featuredImage: ShopImage | null;
  images: ShopImage[];
  options: ProductOption[];
  variants: Variant[];
  /** Only populated by getProduct(). */
  description?: string;
  descriptionHtml?: string;
};

export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopImage | null;
};

export type CartLine = {
  id: string;
  quantity: number;
  variantId: string;
  variantTitle: string;
  image: ShopImage | null;
  price: Money;
  productTitle: string;
  handle: string;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money | null;
  lines: CartLine[];
};

export type ProductSortKey =
  | "BEST_SELLING"
  | "CREATED_AT"
  | "PRICE"
  | "TITLE"
  | "RELEVANCE";

/** A navigation item from a Shopify menu, with `href` already localised. */
export type MenuItem = {
  id: string;
  title: string;
  href: string;
  items: MenuItem[];
};
