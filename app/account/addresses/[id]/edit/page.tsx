"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AnnouncementBar from "../../../../components/AnnouncementBar";
import Footer from "../../../../components/Footer";
import Header from "../../../../components/Header";
import { useAuth } from "../../../../contexts/AuthContext";
import AddressForm, {
  type AddressFormValues,
} from "../../AddressForm";

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

export default function EditAddressPage() {
  const params = useParams();
  const rawId = params.id;
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const router = useRouter();
  const { customer, loading: authLoading, refetch } = useAuth();
  const [initial, setInitial] = useState<Partial<AddressFormValues> | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const loadAddress = useCallback(async () => {
    if (!id) {
      setLoadError("Invalid address.");
      setLoadingList(false);
      return;
    }
    setLoadError(null);
    const res = await fetch("/api/customer/addresses", {
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) {
      setLoadError("Sign in with email and password to edit addresses.");
      setLoadingList(false);
      return;
    }
    if (!res.ok) {
      setLoadError("Could not load addresses.");
      setLoadingList(false);
      return;
    }
    const data = (await res.json()) as { addresses?: CustomerAddress[] };
    const found = data.addresses?.find((a) => a.id === id);
    if (!found) {
      setLoadError("Address not found.");
      setLoadingList(false);
      return;
    }
    setInitial({
      address1: found.address1 ?? "",
      address2: found.address2 ?? "",
      city: found.city ?? "",
      province: found.province ?? "",
      country: found.country ?? "",
      zip: found.zip ?? "",
      phone: found.phone ?? "",
    });
    setLoadingList(false);
  }, [id]);

  useEffect(() => {
    if (authLoading || !customer) return;
    setLoadingList(true);
    loadAddress();
  }, [authLoading, customer, loadAddress]);

  async function handleSave(values: AddressFormValues) {
    const res = await fetch(
      `/api/customer/addresses/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      customerUserErrors?: Array<{ message: string }>;
    };
    if (data.customerUserErrors?.length) {
      throw new Error(data.customerUserErrors[0].message);
    }
    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? "Could not update address.");
    }
    await refetch();
    router.push("/account/addresses");
  }

  if (authLoading || loadingList) {
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
        <main className="border-t border-zinc-200 px-4 py-12 text-center text-sm text-zinc-600">
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError || !initial) {
    return (
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <AnnouncementBar />
        <Header />
        <main className="border-t border-zinc-200 px-4 py-12">
          <p className="text-center text-sm text-red-700">
            {loadError ?? "Address not found."}
          </p>
          <Link
            href="/account/addresses"
            className="mt-4 block text-center text-sm underline"
          >
            Back to addresses
          </Link>
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
        <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
          <Link
            href="/account/addresses"
            className="text-xs uppercase tracking-wider text-zinc-600 underline-offset-2 hover:text-black hover:underline"
          >
            Back to addresses
          </Link>
          <h1 className="mt-8 text-xl font-semibold uppercase tracking-[0.2em] text-black">
            Edit address
          </h1>
          <div className="mt-8">
            <AddressForm
              key={id}
              submitLabel="Update address"
              onSubmit={handleSave}
              initial={initial}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
