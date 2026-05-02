"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AnnouncementBar from "../../../components/AnnouncementBar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useAuth } from "../../../contexts/AuthContext";
import AddressForm, {
  type AddressFormValues,
} from "../AddressForm";

export default function NewAddressPage() {
  const router = useRouter();
  const { customer, loading, refetch } = useAuth();

  async function handleSave(values: AddressFormValues) {
    const res = await fetch("/api/customer/addresses", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      customerUserErrors?: Array<{ message: string }>;
    };
    if (data.customerUserErrors?.length) {
      throw new Error(data.customerUserErrors[0].message);
    }
    if (!res.ok || !data.ok) {
      throw new Error(data.error ?? "Could not save address.");
    }
    await refetch();
    router.push("/account/addresses");
  }

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
        <main className="border-t border-zinc-200 px-4 py-12 text-center text-sm text-zinc-600">
          <Link href="/login" className="underline">
            Sign in
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
            Add address
          </h1>
          <div className="mt-8">
            <AddressForm
              submitLabel="Save address"
              onSubmit={handleSave}
              initial={{}}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
