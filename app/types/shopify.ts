/**
 * Types for headless Shopify Storefront API.
 * Use these when wiring real product/collection data from shopifyFetch.
 */
export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string } | null;
  priceRange?: { minVariantPrice: { amount: string; currencyCode: string } };
};

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string } | null;
};
