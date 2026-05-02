"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

type CustomerUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

const FORM_FIELDS = ["firstName", "lastName", "email", "password"] as const;

function fieldPathIncludes(
  fieldPath: string[] | null | undefined,
  name: (typeof FORM_FIELDS)[number]
): boolean {
  if (!fieldPath?.length) return false;
  return fieldPath.some(
    (segment) => segment.toLowerCase() === name.toLowerCase()
  );
}

function messagesForField(
  errors: CustomerUserError[],
  name: (typeof FORM_FIELDS)[number]
): string[] {
  return errors
    .filter((e) => fieldPathIncludes(e.field, name))
    .map((e) => e.message);
}

export default function RegisterPage() {
  const { customer, loading, refetch } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  const inputClassName =
    "w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setShopifyErrors([]);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setGeneralError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        signedIn?: boolean;
        error?: string;
        customerUserErrors?: CustomerUserError[];
        graphQLErrors?: Array<{ message?: string }>;
      };

      if (data.ok) {
        if (data.signedIn) {
          await refetch();
          router.refresh();
          router.replace("/account");
          return;
        }
        router.push("/login?registered=1");
        return;
      }

      if (data.customerUserErrors?.length) {
        setShopifyErrors(data.customerUserErrors);
        const orphans = data.customerUserErrors.filter((err) => {
          if (!err.field?.length) return true;
          return !FORM_FIELDS.some((f) => fieldPathIncludes(err.field, f));
        });
        if (orphans.length > 0) {
          setGeneralError(orphans.map((o) => o.message).join(" "));
        }
        return;
      }

      if (data.graphQLErrors?.length) {
        setGeneralError(
          data.graphQLErrors.map((g) => g.message).filter(Boolean).join(" ") ||
            "Registration failed."
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

  const firstNameErr = messagesForField(shopifyErrors, "firstName");
  const lastNameErr = messagesForField(shopifyErrors, "lastName");
  const emailErr = messagesForField(shopifyErrors, "email");
  const passwordErr = messagesForField(shopifyErrors, "password");

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <AnnouncementBar />
      <Header />

      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center border-t border-zinc-200 px-4 py-16 sm:min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-xl font-semibold uppercase tracking-[0.35em] text-black">
            Register
          </h1>
          <p className="mt-3 text-center text-sm text-zinc-600">
            Please fill in the information below:
          </p>

          {generalError ? (
            <p
              className="mt-6 text-center text-sm text-red-700"
              role="alert"
            >
              {generalError}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <label className="block">
              <span className="sr-only">First name</span>
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="First name"
                className={inputClassName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={submitting}
                aria-invalid={firstNameErr.length > 0}
                aria-describedby={
                  firstNameErr.length ? "firstName-error" : undefined
                }
              />
              {firstNameErr.length > 0 ? (
                <span
                  id="firstName-error"
                  className="mt-1 block text-xs text-red-700"
                >
                  {firstNameErr.join(" ")}
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="sr-only">Last name</span>
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Last name"
                className={inputClassName}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={submitting}
                aria-invalid={lastNameErr.length > 0}
                aria-describedby={
                  lastNameErr.length ? "lastName-error" : undefined
                }
              />
              {lastNameErr.length > 0 ? (
                <span
                  id="lastName-error"
                  className="mt-1 block text-xs text-red-700"
                >
                  {lastNameErr.join(" ")}
                </span>
              ) : null}
            </label>
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
                aria-describedby={emailErr.length ? "email-error" : undefined}
              />
              {emailErr.length > 0 ? (
                <span id="email-error" className="mt-1 block text-xs text-red-700">
                  {emailErr.join(" ")}
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="sr-only">Password</span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Password"
                className={inputClassName}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                aria-invalid={passwordErr.length > 0}
                aria-describedby={
                  passwordErr.length ? "password-error" : undefined
                }
              />
              {passwordErr.length > 0 ? (
                <span
                  id="password-error"
                  className="mt-1 block text-xs text-red-700"
                >
                  {passwordErr.join(" ")}
                </span>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 flex w-full items-center justify-center bg-black px-2 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-zinc-900 disabled:opacity-60 sm:text-sm sm:tracking-[0.25em]"
            >
              {submitting ? "Creating account..." : "Create my account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-zinc-900 underline-offset-2 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
