"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function CartPage() {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        setCheckoutUrl(data?.checkoutUrl ?? null);
        setCount(data?.count ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  if (count === 0 || !checkoutUrl) {
    return (
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <AnnouncementBar />
        <Header />
        <main className="border-t border-zinc-200 px-4 py-12">
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-xl font-medium uppercase tracking-tight text-zinc-900">
              Your cart is empty
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Add items from the shop to checkout.
            </p>
            <Link
              href="/new-arrivals"
              className="mt-6 inline-block bg-black px-6 py-3 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-zinc-800"
            >
              Continue shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />
      <main className="border-t border-zinc-200 px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-medium uppercase tracking-tight text-zinc-900">
            Cart
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {count} {count === 1 ? "item" : "items"} in your cart.
          </p>
          <a
            href={checkoutUrl}
            className="mt-6 inline-block bg-black px-6 py-3 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-zinc-800"
          >
            Proceed to checkout
          </a>
          <Link
            href="/new-arrivals"
            className="mt-4 block text-sm text-zinc-600 underline hover:no-underline"
          >
            Continue shopping
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
