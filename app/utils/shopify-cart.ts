import type { CartLine } from "@/app/contexts/CartContext";

export const SHOPIFY_CART_ID_COOKIE = "shopify_cart_id";

export type SerializedCart = {
  count: number;
  checkoutUrl: string | null;
  cartId: string | null;
  lines: CartLine[];
  totalAmount: { amount: string; currencyCode: string } | null;
};

export function serializeStorefrontCart(cart: unknown): SerializedCart {
  if (!cart || typeof cart !== "object") {
    return {
      count: 0,
      checkoutUrl: null,
      cartId: null,
      lines: [],
      totalAmount: null,
    };
  }

  const c = cart as {
    id?: string;
    checkoutUrl?: string | null;
    cost?: {
      totalAmount?: { amount: string; currencyCode: string } | null;
    };
    lines?: {
      edges?: Array<{
        node?: {
          id: string;
          quantity: number;
          merchandise?: {
            id: string;
            title: string;
            image?: { url: string; altText?: string } | null;
            price?: { amount: string; currencyCode: string };
            compareAtPrice?: { amount: string; currencyCode: string } | null;
            product?: {
              title?: string;
              handle?: string;
              featuredImage?: { url: string; altText?: string } | null;
            };
          };
          cost?: { totalAmount?: { amount: string; currencyCode: string } };
        };
      }>;
    };
  };

  const edges = c.lines?.edges ?? [];
  const count = edges.reduce(
    (sum, e) => sum + (e.node?.quantity ?? 0),
    0
  );

  const lines: CartLine[] = edges.map((e) => {
    const n = e.node;
    const merch = n?.merchandise;
    const img =
      merch?.image ??
      merch?.product?.featuredImage ??
      null;
    return {
      id: n?.id ?? "",
      quantity: n?.quantity ?? 0,
      merchandiseId: merch?.id,
      title: merch?.title ?? merch?.product?.title,
      image: img,
      price: merch?.price,
      compareAtPrice: merch?.compareAtPrice ?? null,
      productHandle: merch?.product?.handle,
      cost: n?.cost?.totalAmount,
    };
  });

  return {
    count,
    checkoutUrl: c.checkoutUrl ?? null,
    cartId: c.id ?? null,
    lines,
    totalAmount: c.cost?.totalAmount ?? null,
  };
}
