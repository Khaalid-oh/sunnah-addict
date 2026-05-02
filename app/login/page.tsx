"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

type CustomerUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

const LOGIN_FIELDS = ["email", "password"] as const;

function fieldPathIncludes(
  fieldPath: string[] | null | undefined,
  name: (typeof LOGIN_FIELDS)[number]
): boolean {
  if (!fieldPath?.length) return false;
  return fieldPath.some(
    (segment) => segment.toLowerCase() === name.toLowerCase()
  );
}

function messagesForField(
  errors: CustomerUserError[],
  name: (typeof LOGIN_FIELDS)[number]
): string[] {
  return errors
    .filter((e) => fieldPathIncludes(e.field, name))
    .map((e) => e.message);
}

function LoginContent() {
  const { customer, loading, refetch } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showRegisteredNotice = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [shopifyErrors, setShopifyErrors] = useState<CustomerUserError[]>([]);

  useEffect(() => {
    if (!loading && customer) {
      router.replace("/account");
    }
  }, [customer, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setShopifyErrors([]);

    if (!email.trim() || !password) {
      setGeneralError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        customerUserErrors?: CustomerUserError[];
        graphQLErrors?: Array<{ message?: string }>;
      };

      if (data.ok) {
        await refetch();
        router.refresh();
        router.replace("/account");
        return;
      }

      if (data.customerUserErrors?.length) {
        setShopifyErrors(data.customerUserErrors);
        const orphans = data.customerUserErrors.filter((err) => {
          if (!err.field?.length) return true;
          return !LOGIN_FIELDS.some((f) => fieldPathIncludes(err.field, f));
        });
        if (orphans.length > 0) {
          setGeneralError(orphans.map((o) => o.message).join(" "));
        }
        return;
      }

      if (data.graphQLErrors?.length) {
        setGeneralError(
          data.graphQLErrors.map((g) => g.message).filter(Boolean).join(" ") ||
            "Login failed."
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

  if (customer) {
    return (
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <AnnouncementBar />
        <Header />
        <main className="border-t border-zinc-200 px-4 py-12">
          <p className="text-center text-sm text-zinc-500">Redirecting...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const emailErr = messagesForField(shopifyErrors, "email");
  const passwordErr = messagesForField(shopifyErrors, "password");

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center border-t border-zinc-200 px-4 py-16 sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-xl font-semibold uppercase tracking-[0.35em] text-black">
            Login
          </h1>
          <p className="mt-3 text-center text-sm text-zinc-600">
            Please enter your e-mail and password:
          </p>

          {showRegisteredNotice ? (
            <p className="mt-4 text-center text-sm text-zinc-700" role="status">
              Your account was created. Sign in with the password you chose.
            </p>
          ) : null}

          {generalError ? (
            <p
              className="mt-4 text-center text-sm text-red-700"
              role="alert"
            >
              {generalError}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                className="w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                aria-invalid={emailErr.length > 0}
                aria-describedby={emailErr.length ? "login-email-error" : undefined}
              />
              {emailErr.length > 0 ? (
                <span
                  id="login-email-error"
                  className="mt-1 block text-xs text-red-700"
                >
                  {emailErr.join(" ")}
                </span>
              ) : null}
            </label>

            <div>
              <span className="sr-only">Password</span>
              <div className="flex items-center border border-zinc-200 bg-white px-4 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  aria-invalid={passwordErr.length > 0}
                  aria-describedby={
                    passwordErr.length ? "login-password-error" : undefined
                  }
                />
                <Link
                  href="/forgot-password"
                  className="ml-3 shrink-0 text-xs text-zinc-600 underline-offset-2 hover:text-black hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              {passwordErr.length > 0 ? (
                <span
                  id="login-password-error"
                  className="mt-1 block text-xs text-red-700"
                >
                  {passwordErr.join(" ")}
                </span>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 flex w-full items-center justify-center bg-black py-3 text-sm font-medium uppercase tracking-[0.35em] text-white transition hover:bg-zinc-900 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Or{" "}
            <a
              href="/api/auth/login"
              className="text-zinc-700 underline-offset-2 hover:text-black hover:underline"
            >
              continue with Shopify account (OAuth)
            </a>
          </p>

          <p className="mt-8 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-zinc-900 underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function LoginFallback() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
