/* ============================================
   SHAHMEEN HUSAIN — Shopify Headless Config
   --------------------------------------------
   This connects the custom storefront to the
   client's LIVE Shopify store via the public
   Storefront API. No products are copied or
   scraped — everything is fetched live.

   HOW TO FILL THIS IN (one-time, ~3 min):
   1. Log into her Shopify admin (admin.shopify.com).
   2. Settings → Apps and sales channels →
      Develop apps → Create an app ("Headless Storefront").
   3. Configuration → Storefront API → enable, and tick:
        - unauthenticated_read_product_listings
        - unauthenticated_read_product_inventory
        - unauthenticated_read_product_tags
        - unauthenticated_read_selling_plans
        - unauthenticated_write_checkouts
        - unauthenticated_read_checkouts
   4. Install app → API credentials → copy the
      "Storefront API access token".
   5. Paste it below as STOREFRONT_TOKEN.

   SAFE TO COMMIT: The Storefront token is a PUBLIC,
   read-only token designed to live in frontend code.
   NEVER put her password or an Admin API token here.
   ============================================ */

window.SHOPIFY_CONFIG = {
  // Permanent *.myshopify.com domain — used on purpose (NOT shahmeenhusain.com)
  // so the API keeps working after the custom domain is repointed to Vercel.
  domain: 'shahmeenhusain.myshopify.com',

  // Storefront API version (bump periodically).
  apiVersion: '2024-10',

  // Public Storefront API access token (read-only; safe in frontend code).
  // Issued by the Shopify "Headless" channel storefront "Shahmeenhusain Headless".
  storefrontToken: '48666ef678acb133468c05d8f7358649',

  // Store currency for formatting fallbacks.
  currencyCode: 'INR'
};
