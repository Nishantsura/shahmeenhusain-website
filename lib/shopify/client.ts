import "server-only";

/* ============================================
   Storefront API transport (server-side only)
   --------------------------------------------
   The legacy site called this from the browser on every page load, so
   nothing was cached and nothing was in the HTML for crawlers. Running
   it on the server gives us ISR and real SSR output.
   ============================================ */

export const SHOPIFY_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ?? "shahmeenhusain.myshopify.com";

export const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION ?? "2024-10";

const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN ?? "";

export const CURRENCY = process.env.SHOPIFY_CURRENCY ?? "INR";

export function isConfigured(): boolean {
  return Boolean(TOKEN && TOKEN !== "PASTE_STOREFRONT_API_TOKEN_HERE" && SHOPIFY_DOMAIN);
}

const endpoint = () =>
  `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

type StorefrontOptions = {
  variables?: Record<string, unknown>;
  /** Seconds. Omit for the default; pass 0 to opt out of caching. */
  revalidate?: number;
  tags?: string[];
};

export async function storefront<T>(
  query: string,
  { variables = {}, revalidate = 300, tags }: StorefrontOptions = {},
): Promise<T> {
  if (!isConfigured()) {
    throw new Error(
      "Shopify Storefront token is not configured. Set SHOPIFY_STOREFRONT_TOKEN.",
    );
  }

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: revalidate === 0 ? { revalidate: 0 } : { revalidate, tags },
  });

  if (!res.ok) {
    throw new Error(`Storefront API HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(
      "Storefront API error: " + json.errors.map((e) => e.message).join("; "),
    );
  }

  return json.data as T;
}

/** Cart operations must never be cached. */
export function storefrontLive<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  return storefront<T>(query, { variables, revalidate: 0 });
}
