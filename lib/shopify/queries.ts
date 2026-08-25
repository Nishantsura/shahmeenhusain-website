/* ============================================
   Storefront GraphQL — ported verbatim from
   legacy/js/shopify.js. These are correct and
   proven against the live store; do not "tidy".
   Caps are deliberate: 10 images, 20 variants,
   50 cart lines. There is no pagination yet.
   ============================================ */

export const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    title
    handle
    productType
    tags
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
              }
              product {
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query Products($first: Int!, $sortKey: ProductSortKeys!, $reverse: Boolean) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      title
      description
      products(first: $first) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  }
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
      description
      descriptionHtml
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  ${CART_FIELDS}
  query GetCart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
`;

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_ADD = /* GraphQL */ `
  ${CART_FIELDS}
  mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE = /* GraphQL */ `
  ${CART_FIELDS}
  mutation UpdateLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE = /* GraphQL */ `
  ${CART_FIELDS}
  mutation RemoveLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

/**
 * Collections index.
 *
 * Deliberately a NEW query rather than an edit to COLLECTIONS_QUERY,
 * which is proven against the live store. Most collections in this shop
 * have no `image` set, so it also pulls the first product's shot as a
 * cover fallback — one request rather than an N+1 per card — and enough
 * of a product count to drop the empty collections.
 */
export const COLLECTIONS_INDEX_QUERY = /* GraphQL */ `
  query CollectionsIndex($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Navigation, straight from the store's Shopify admin.
 *
 * Shopify nests menu items three deep at most, so the query is written
 * out rather than recursed. `url` comes back absolute and pointing at
 * the live myshopify/primary domain — getMenu() rewrites it.
 */
export const MENU_QUERY = /* GraphQL */ `
  query Menu($handle: String!) {
    menu(handle: $handle) {
      id
      handle
      items {
        id
        title
        url
        items {
          id
          title
          url
          items {
            id
            title
            url
          }
        }
      }
    }
  }
`;
