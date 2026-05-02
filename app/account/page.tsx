"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  useCart,
  type CartLine,
  type CartSnapshot,
} from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

function storeRoot(): string | null {
  const raw = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
  const trimmed = raw.replace(/\/$/, "");
  return trimmed || null;
}

function labelFromEnum(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatMoney(amount: string, currency: string): string {
  const n = Number.parseFloat(amount);
  if (Number.isNaN(n)) return amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(n);
  } catch {
    return `${amount} ${currency}`;
  }
}

function CartLineRow({ line }: { line: CartLine }) {
  const href = line.productHandle
    ? `/products/${line.productHandle}`
    : null;
  const displayTitle = line.title ?? "Item";
  const lineTotal =
    line.cost?.amount && line.cost?.currencyCode
      ? formatMoney(line.cost.amount, line.cost.currencyCode)
      : line.price
        ? formatMoney(line.price.amount, line.price.currencyCode)
        : null;

  const inner = (
    <div className="flex gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-zinc-100">
        {line.image?.url ? (
          <Image
            src={line.image.url}
            alt={line.image.altText || displayTitle}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized={line.image.url.includes("shopify.com") === false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
            No image
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900">{displayTitle}</p>
        <p className="mt-0.5 text-xs text-zinc-500">Qty {line.quantity}</p>
        {lineTotal ? (
          <p className="mt-0.5 text-sm text-zinc-700">{lineTotal}</p>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <li className="border border-zinc-200 p-3 transition hover:border-zinc-300">
        <Link href={href} className="block">
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li className="border border-zinc-200 p-3">
      {inner}
    </li>
  );
}

export default function AccountPage() {
  const { customer, loading, refetch } = useAuth();
  const { refreshCart } = useCart();
  const shopRoot = storeRoot();
  const addressesHref = shopRoot ? `${shopRoot}/account/addresses` : null;

  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (loading || !customer) {
      return;
    }
    let cancelled = false;
    setCartLoading(true);
    refreshCart()
      .then((snap) => {
        if (!cancelled) setCart(snap);
      })
      .finally(() => {
        if (!cancelled) setCartLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customer, loading, refreshCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <AnnouncementBar />
        <Header />
        <main className="border-t border-zinc-200 px-4 py-12">
          <p className="text-center text-sm text-zinc-500">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <AnnouncementBar />
        <Header />
        <main className="border-t border-zinc-200 px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-zinc-600">
              You need to be logged in to view your account.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium underline hover:no-underline"
            >
              Log in
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const first = customer.firstName?.trim() || "";
  const last = customer.lastName?.trim() || "";
  const fullName = [first, last].filter(Boolean).join(" ");
  const welcomeName = first || customer.email?.split("@")[0] || "there";
  const initials = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";

  const addr = customer.defaultAddress;
  const addressLines: string[] = [];
  if (addr) {
    const line1 = [addr.address1, addr.address2].filter(Boolean).join(", ");
    if (line1) addressLines.push(line1);
    const line2 = [addr.city, addr.province, addr.zip].filter(Boolean).join(", ");
    if (line2) addressLines.push(line2);
    if (addr.country) addressLines.push(addr.country);
  }

  const hasPurchases =
    customer.authSource === "storefront" &&
    customer.recentOrders &&
    customer.recentOrders.length > 0;
  const showStorefrontProfile = customer.authSource === "storefront";

  const cartLines = cart?.lines ?? [];
  const hasCartItems = cartLines.length > 0;
  const cartTotal =
    cart?.totalAmount &&
    formatMoney(cart.totalAmount.amount, cart.totalAmount.currencyCode);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="border-t border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <a
              href="/api/auth/logout"
              className="inline-flex w-fit border border-black px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
            >
              Logout
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-black text-lg font-medium uppercase text-black"
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold uppercase tracking-[0.2em] text-black sm:text-3xl">
                My account
              </h1>
              <p className="mt-2 text-base text-zinc-700">
                Welcome back, {welcomeName}!
              </p>
              {fullName ? (
                <p className="mt-1 text-sm text-zinc-600">{fullName}</p>
              ) : null}
            </div>
          </div>

          {showStorefrontProfile ? (
            <div className="mt-10 grid gap-3 border border-zinc-200 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
              {customer.email ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-zinc-900">{customer.email}</p>
                </div>
              ) : null}
              {customer.phone ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Phone
                  </p>
                  <p className="mt-1 text-sm text-zinc-900">{customer.phone}</p>
                </div>
              ) : null}
              {customer.numberOfOrders != null ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Total orders
                  </p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {customer.numberOfOrders}
                  </p>
                </div>
              ) : null}
              {customer.createdAt ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Member since
                  </p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {new Date(customer.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <section>
              <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-900">
                My orders
              </h2>
              <div className="mt-3 border-t border-zinc-200" />

              <div className="mt-8">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                  In your cart
                </h3>
                <div className="mt-3">
                  {cartLoading ? (
                    <p className="text-sm text-zinc-500">Loading cart...</p>
                  ) : hasCartItems ? (
                    <>
                      <ul className="space-y-3">
                        {cartLines.map((line) => (
                          <CartLineRow key={line.id} line={line} />
                        ))}
                      </ul>
                      {cartTotal ? (
                        <p className="mt-4 text-sm font-medium text-zinc-900">
                          Estimated total: {cartTotal}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href="/cart"
                          className="inline-flex border border-black px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-black transition hover:bg-black hover:text-white"
                        >
                          View cart
                        </Link>
                        {cart?.checkoutUrl ? (
                          <a
                            href={cart.checkoutUrl}
                            className="inline-flex bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-zinc-900"
                          >
                            Checkout
                          </a>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-600">Your cart is empty.</p>
                  )}
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                  Past purchases
                </h3>
                <div className="mt-3">
                  {hasPurchases ? (
                    <ul className="space-y-6">
                      {customer.recentOrders!.map((order) => (
                        <li
                          key={order.id}
                          className="border border-zinc-200 px-4 py-4 text-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <span className="font-medium text-zinc-900">
                                {order.name || "Order"}
                                {order.orderNumber != null
                                  ? ` · #${order.orderNumber}`
                                  : ""}
                              </span>
                              <div className="mt-1 text-xs text-zinc-500">
                                {order.processedAt
                                  ? new Date(order.processedAt).toLocaleString()
                                  : ""}
                              </div>
                            </div>
                            <span className="font-medium text-zinc-900">
                              {order.totalAmount}{" "}
                              <span className="text-zinc-600">
                                {order.totalCurrency}
                              </span>
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                            {order.financialStatus ? (
                              <span className="border border-zinc-200 px-2 py-0.5">
                                Payment: {labelFromEnum(order.financialStatus)}
                              </span>
                            ) : null}
                            {order.fulfillmentStatus ? (
                              <span className="border border-zinc-200 px-2 py-0.5">
                                Fulfillment:{" "}
                                {labelFromEnum(order.fulfillmentStatus)}
                              </span>
                            ) : null}
                          </div>
                          {order.lineItems.length > 0 ? (
                            <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-700">
                              {order.lineItems.map((li, i) => (
                                <li
                                  key={`${order.id}-li-${i}`}
                                  className="flex justify-between gap-2"
                                >
                                  <span>{li.title}</span>
                                  <span className="shrink-0 text-zinc-500">
                                    ×{li.quantity}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : customer.authSource === "storefront" ? (
                    <p className="text-sm text-zinc-600">
                      You haven&apos;t placed any orders yet.
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-600">
                      Order history for this sign-in method is in your{" "}
                      <a
                        href={shopRoot ? `${shopRoot}/account` : "/"}
                        className="underline underline-offset-2 hover:text-zinc-900"
                      >
                        Shopify customer account
                      </a>
                      .
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-900">
                Primary address
              </h2>
              <div className="mt-3 border-t border-zinc-200" />
              <div className="mt-6 text-sm leading-relaxed text-zinc-700">
                {addressLines.length > 0 ? (
                  addressLines.map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p className="text-zinc-600">
                    {customer.authSource === "storefront"
                      ? "No default address on file."
                      : "Manage addresses from your store account."}
                  </p>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {customer.authSource === "storefront" ? (
                  <Link
                    href="/account/addresses"
                    className="inline-flex bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-zinc-900"
                  >
                    Manage addresses
                  </Link>
                ) : null}
                {addressesHref ? (
                  <a
                    href={addressesHref}
                    className="inline-flex border border-black px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
                  >
                    Store account addresses
                  </a>
                ) : null}
              </div>
            </section>
          </div>

          <p className="mt-14 text-sm text-zinc-500">
            <Link
              href="/"
              className="underline underline-offset-2 hover:text-zinc-900"
            >
              Continue shopping
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
