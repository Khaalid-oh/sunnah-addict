"use client";

import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

export default function AccountPage() {
  const { customer, loading } = useAuth();

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
            <p className="text-sm text-zinc-600">You need to be logged in to view your account.</p>
            <a
              href="/api/auth/login"
              className="mt-4 inline-block text-sm font-medium underline hover:no-underline"
            >
              Log in
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ") || "Account";

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="border-t border-zinc-200">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-medium uppercase tracking-tight text-zinc-900">
            Account
          </h1>
          <div className="mt-8 space-y-4 border-t border-zinc-200 pt-8">
            <p className="text-sm text-zinc-600">
              <span className="font-medium text-zinc-900">Name:</span>{" "}
              {displayName}
            </p>
            {customer.email && (
              <p className="text-sm text-zinc-600">
                <span className="font-medium text-zinc-900">Email:</span>{" "}
                {customer.email}
              </p>
            )}
          </div>
          <p className="mt-8 text-sm text-zinc-500">
            <Link href="/" className="underline hover:no-underline">
              Continue shopping
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
