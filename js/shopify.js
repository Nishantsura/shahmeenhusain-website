/* ============================================
   SHAHMEEN HUSAIN — Shopify Storefront Client
   --------------------------------------------
   Live headless data layer. Fetches products,
   collections, and drives the cart/checkout
   against the client's real Shopify store.
   Requires js/shopify-config.js loaded first.
   ============================================ */

const Shopify = (() => {
  const cfg = window.SHOPIFY_CONFIG || {};
  const CART_KEY = 'sh_cart_id';

  function isConfigured() {
    return (
      cfg.storefrontToken &&
      cfg.storefrontToken !== 'PASTE_STOREFRONT_API_TOKEN_HERE' &&
      cfg.domain
    );
  }

  const endpoint = () =>
    `https://${cfg.domain}/api/${cfg.apiVersion || '2024-10'}/graphql.json`;

  // ---- Core GraphQL request ----
  async function gql(query, variables = {}) {
    if (!isConfigured()) {
      throw new Error(
        'Shopify not configured — add the Storefront API token in js/shopify-config.js'
      );
    }
    const res = await fetch(endpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': cfg.storefrontToken
      },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) {
      throw new Error(`Storefront API HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.errors) {
      throw new Error(
        'Storefront API error: ' + json.errors.map((e) => e.message).join('; ')
      );
    }
    return json.data;
  }

  // ---- Money formatting ----
  function formatMoney(amount, currency) {
    const code = currency || cfg.currencyCode || 'INR';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0
      }).format(Number(amount));
    } catch (e) {
      return `${code} ${Number(amount).toLocaleString('en-IN')}`;
    }
  }

  // ---- Fragments ----
  const PRODUCT_FIELDS = `
    id
    title
    handle
    productType
    tags
    availableForSale
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    featuredImage { url altText width height }
    images(first: 10) { edges { node { url altText } } }
    options { name values }
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
        }
      }
    }
  `;

  // ---- Queries ----
  async function getProducts({ first = 24, sortKey = 'BEST_SELLING' } = {}) {
    const data = await gql(
      `query Products($first: Int!, $sortKey: ProductSortKeys!) {
        products(first: $first, sortKey: $sortKey) {
          edges { node { ${PRODUCT_FIELDS} } }
        }
      }`,
      { first, sortKey }
    );
    return data.products.edges.map((e) => e.node);
  }

  async function getCollections({ first = 30 } = {}) {
    const data = await gql(
      `query Collections($first: Int!) {
        collections(first: $first) {
          edges { node { id title handle description image { url altText } } }
        }
      }`,
      { first }
    );
    return data.collections.edges.map((e) => e.node);
  }

  async function getCollectionProducts(handle, { first = 48 } = {}) {
    const data = await gql(
      `query CollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          title
          description
          products(first: $first) { edges { node { ${PRODUCT_FIELDS} } } }
        }
      }`,
      { handle, first }
    );
    if (!data.collection) return null;
    return {
      title: data.collection.title,
      description: data.collection.description,
      products: data.collection.products.edges.map((e) => e.node)
    };
  }

  async function getProduct(handle) {
    const data = await gql(
      `query Product($handle: String!) {
        product(handle: $handle) {
          ${PRODUCT_FIELDS}
          description
          descriptionHtml
        }
      }`,
      { handle }
    );
    return data.product;
  }

  // ---- Cart (checkout hands off to Shopify) ----
  async function createCart() {
    const data = await gql(
      `mutation { cartCreate { cart { id checkoutUrl } userErrors { message } } }`
    );
    const cart = data.cartCreate.cart;
    if (cart) localStorage.setItem(CART_KEY, cart.id);
    return cart;
  }

  async function getOrCreateCartId() {
    const existing = localStorage.getItem(CART_KEY);
    if (existing) return existing;
    const cart = await createCart();
    return cart.id;
  }

  const CART_FIELDS = `
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              image { url altText }
              price { amount currencyCode }
              product { title handle }
            }
          }
        }
      }
    }
  `;

  function normalizeCart(cart) {
    if (!cart) return null;
    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
      subtotal: cart.cost && cart.cost.subtotalAmount,
      lines: (cart.lines ? cart.lines.edges : []).map((e) => ({
        id: e.node.id,
        quantity: e.node.quantity,
        variantId: e.node.merchandise.id,
        variantTitle: e.node.merchandise.title,
        image: e.node.merchandise.image,
        price: e.node.merchandise.price,
        productTitle: e.node.merchandise.product.title,
        handle: e.node.merchandise.product.handle
      }))
    };
  }

  async function getCart() {
    const cartId = localStorage.getItem(CART_KEY);
    if (!cartId) return null;
    const data = await gql(
      `query GetCart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
      { id: cartId }
    );
    if (!data.cart) {
      localStorage.removeItem(CART_KEY);
      return null;
    }
    return normalizeCart(data.cart);
  }

  async function addToCart(variantId, quantity = 1) {
    let cartId = await getOrCreateCartId();
    const run = (id) =>
      gql(
        `mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart { ${CART_FIELDS} }
            userErrors { message }
          }
        }`,
        { cartId: id, lines: [{ merchandiseId: variantId, quantity }] }
      );

    let data = await run(cartId);
    // Cart may have expired — reset and retry once with a fresh cart.
    if (!data.cartLinesAdd.cart) {
      localStorage.removeItem(CART_KEY);
      cartId = await getOrCreateCartId();
      data = await run(cartId);
    }
    const result = data.cartLinesAdd;
    if (result.userErrors && result.userErrors.length) {
      throw new Error(result.userErrors.map((e) => e.message).join('; '));
    }
    return normalizeCart(result.cart);
  }

  async function updateCartLine(lineId, quantity) {
    const cartId = localStorage.getItem(CART_KEY);
    if (!cartId) return null;
    const data = await gql(
      `mutation UpdateLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart { ${CART_FIELDS} }
          userErrors { message }
        }
      }`,
      { cartId, lines: [{ id: lineId, quantity }] }
    );
    return normalizeCart(data.cartLinesUpdate.cart);
  }

  async function removeCartLine(lineId) {
    const cartId = localStorage.getItem(CART_KEY);
    if (!cartId) return null;
    const data = await gql(
      `mutation RemoveLines($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart { ${CART_FIELDS} }
          userErrors { message }
        }
      }`,
      { cartId, lineIds: [lineId] }
    );
    return normalizeCart(data.cartLinesRemove.cart);
  }

  // ---- Card markup (matches existing .product-card CSS) ----
  function productCardHTML(p, hrefBase = 'product.html') {
    const price = p.priceRange.minVariantPrice;
    const compareAt =
      p.compareAtPriceRange &&
      p.compareAtPriceRange.minVariantPrice &&
      Number(p.compareAtPriceRange.minVariantPrice.amount) >
        Number(price.amount)
        ? p.compareAtPriceRange.minVariantPrice
        : null;
    const img = p.featuredImage;
    const sizeOpt = p.options.find((o) => /size/i.test(o.name));
    const sizes = sizeOpt ? sizeOpt.values : [];
    const category = (p.productType || '').toLowerCase();

    return `
      <a href="${hrefBase}?handle=${encodeURIComponent(p.handle)}"
         class="product-card"
         data-reveal="rise" data-cursor="View"
         data-category="${category}" data-price="${Math.round(Number(price.amount))}">
        <div class="product-card__image-wrap">
          ${
            img
              ? `<img src="${img.url}" alt="${(img.altText || p.title).replace(/"/g, '&quot;')}" loading="lazy" class="product-card__image">`
              : `<div class="placeholder-img">${p.title}</div>`
          }
          <div class="product-card__quick-shop">Quick Shop</div>
        </div>
        <div class="product-card__info">
          <h3 class="product-card__name">${p.title}</h3>
          <p class="product-card__price">
            ${formatMoney(price.amount, price.currencyCode)}
            ${
              compareAt
                ? `<span class="product-card__price-compare">${formatMoney(
                    compareAt.amount,
                    compareAt.currencyCode
                  )}</span>`
                : ''
            }
          </p>
          <div class="product-card__sizes">
            ${sizes
              .map((s) => `<span class="product-card__size">${s}</span>`)
              .join('')}
          </div>
        </div>
      </a>`;
  }

  return {
    isConfigured,
    formatMoney,
    getProducts,
    getCollections,
    getCollectionProducts,
    getProduct,
    createCart,
    getCart,
    addToCart,
    updateCartLine,
    removeCartLine,
    productCardHTML
  };
})();

window.Shopify = Shopify;
