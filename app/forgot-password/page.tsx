"use client";

import Link from "next/link";
import { useState } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";

type CustomerUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [shopifyErrors, setShopifyErrors] = useState<CustomerUserError[]>([]);
  const [sent, setSent] = useState(false);

  const inputClassName =
    "w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setShopifyErrors([]);

    if (!email.trim()) {
      setGeneralError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        customerUserErrors?: CustomerUserError[];
        graphQLErrors?: Array<{ message?: string }>;
      };

      if (data.ok) {
        setSent(true);
        return;
      }

      if (data.customerUserErrors?.length) {
        setShopifyErrors(data.customerUserErrors);
        const unscoped = data.customerUserErrors.filter(
          (err) => !err.field?.length
        );
        if (unscoped.length > 0) {
          setGeneralError(unscoped.map((u) => u.message).join(" "));
        }
        return;
      }

      if (data.graphQLErrors?.length) {
        setGeneralError(
          data.graphQLErrors.map((g) => g.message).filter(Boolean).join(" ") ||
            "Request failed."
        );
        return;
      }

      setGeneralError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const emailErr = shopifyErrors
    .filter((e) =>
      e.field?.some((s) => s.toLowerCase() === "email")
    )
    .map((e) => e.message);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center border-t border-zinc-200 px-4 py-16 sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-xl font-semibold uppercase tracking-[0.35em] text-black">
            Reset password
          </h1>
          <p className="mt-3 text-center text-sm text-zinc-600">
            Enter your email and we&apos;ll send reset instructions if an account
            exists.
          </p>

          {sent ? (
            <p className="mt-8 text-center text-sm text-zinc-700" role="status">
              If that email is registered, you will receive a link to reset your
              password shortly.
            </p>
          ) : null}

          {generalError && !sent ? (
            <p className="mt-6 text-center text-sm text-red-700" role="alert">
              {generalError}
            </p>
          ) : null}

          {!sent ? (
            <form onSubmit={handleSubmit} className="mt-10 space-y-4">
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  className={inputClassName}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  aria-invalid={emailErr.length > 0}
                  aria-describedby={
                    emailErr.length ? "recover-email-error" : undefined
                  }
                />
                {emailErr.length > 0 ? (
                  <span
                    id="recover-email-error"
                    className="mt-1 block text-xs text-red-700"
                  >
                    {emailErr.join(" ")}
                  </span>
                ) : null}
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-center bg-black py-3 text-sm font-medium uppercase tracking-[0.35em] text-white transition hover:bg-zinc-900 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          ) : null}

          <p className="mt-8 text-center text-sm text-zinc-600">
            <Link
              href="/login"
              className="text-zinc-900 underline-offset-2 hover:underline"
            >
              Back to login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
