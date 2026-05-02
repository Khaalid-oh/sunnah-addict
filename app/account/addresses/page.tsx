"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AnnouncementBar from "../../components/AnnouncementBar";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";

type CustomerAddress = {
  id: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  zip?: string | null;
  phone?: string | null;
};

export default function AddressesPage() {
  const { customer, loading: authLoading, refetch } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/customer/addresses", {
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) {
      setAddresses([]);
      setDefaultId(null);
      setError("storefront_only");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to load addresses.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as {
      defaultAddressId?: string | null;
      addresses?: CustomerAddress[];
    };
    setAddresses(data.addresses ?? []);
    setDefaultId(data.defaultAddressId ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!customer) return;
    setLoading(true);
    load();
  }, [authLoading, customer, load]);

  async function handleSetDefault(id: string) {
    const res = await fetch(
      `/api/customer/addresses/${encodeURIComponent(id)}/default`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      alert(data.error ?? "Could not set default address.");
      return;
    }
    setDefaultId(id);
    await refetch();
  }

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Delete this address? This cannot be undone."
      )
    ) {
      return;
    }
    const res = await fetch(
      `/api/customer/addresses/${encodeURIComponent(id)}`,
      { method: "DELETE", credentials: "include" }
    );
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      alert(data.error ?? "Could not delete address.");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (defaultId === id) setDefaultId(null);
    await refetch();
  }

  if (authLoading) {
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
          <div className="mx-auto max-w-lg text-center">
            <p className="text-sm text-zinc-600">Sign in to manage addresses.</p>
            <Link href="/login" className="mt-4 inline-block text-sm underline">
              Log in
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

      <main className="border-t border-zinc-200">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/account"
              className="text-xs uppercase tracking-wider text-zinc-600 underline-offset-2 hover:text-black hover:underline"
            >
              Back to account
            </Link>
            <Link
              href="/account/addresses/new"
              className="border border-black px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
            >
              Add address
            </Link>
          </div>

          <h1 className="mt-8 text-2xl font-semibold uppercase tracking-[0.2em] text-black">
            Addresses
          </h1>

          {error === "storefront_only" ? (
            <p className="mt-6 text-sm text-zinc-600">
              Saved addresses can be managed when you sign in with{" "}
              <strong>email and password</strong> (Storefront customer account).
              Shopify Account sign-in uses a different profile — use your store’s
              account area for addresses, or add a password login.
            </p>
          ) : null}

          {error && error !== "storefront_only" ? (
            <p className="mt-6 text-sm text-red-700">{error}</p>
          ) : null}

          {loading ? (
            <p className="mt-8 text-sm text-zinc-500">Loading addresses...</p>
          ) : error === "storefront_only" ? null : addresses.length === 0 ? (
            <p className="mt-8 text-sm text-zinc-600">
              No saved addresses yet. Add one to speed up checkout.
            </p>
          ) : (
            <ul className="mt-8 space-y-4">
              {addresses.map((addr) => {
                const lines = [
                  [addr.address1, addr.address2].filter(Boolean).join(", "),
                  [addr.city, addr.province, addr.zip].filter(Boolean).join(", "),
                  addr.country,
                  addr.phone,
                ].filter(Boolean);
                const isDefault = defaultId === addr.id;
                return (
                  <li
                    key={addr.id}
                    className="border border-zinc-200 px-4 py-4 text-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1 text-zinc-800">
                        {lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                        {isDefault ? (
                          <span className="inline-block border border-zinc-300 px-2 py-0.5 text-xs uppercase tracking-wider text-zinc-600">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.id)}
                            className="text-xs uppercase tracking-wider text-zinc-600 underline hover:text-black"
                          >
                            Set as default
                          </button>
                        ) : null}
                        <Link
                          href={`/account/addresses/${encodeURIComponent(addr.id)}/edit`}
                          className="text-xs uppercase tracking-wider text-zinc-600 underline hover:text-black"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(addr.id)}
                          className="text-xs uppercase tracking-wider text-red-700 underline hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
