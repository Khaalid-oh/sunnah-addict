"use client";

import { useState } from "react";

export type AddressFormValues = {
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
};

const empty: AddressFormValues = {
  address1: "",
  address2: "",
  city: "",
  province: "",
  country: "",
  zip: "",
  phone: "",
};

function normalizeInitial(
  initial?: Partial<AddressFormValues> | null
): AddressFormValues {
  return {
    ...empty,
    ...Object.fromEntries(
      Object.entries(initial ?? {}).map(([k, v]) => [k, v ?? ""])
    ),
  } as AddressFormValues;
}

type Props = {
  initial?: Partial<AddressFormValues> | null;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (values: AddressFormValues) => Promise<void>;
};

export default function AddressForm({
  initial,
  submitLabel,
  disabled,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(() => normalizeInitial(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof AddressFormValues>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !form.address1.trim() ||
      !form.city.trim() ||
      !form.country.trim() ||
      !form.zip.trim()
    ) {
      setError("Address, city, country, and ZIP are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          Address line 1
        </span>
        <input
          className={`mt-1 ${inputClass}`}
          value={form.address1}
          onChange={(e) => update("address1", e.target.value)}
          disabled={disabled || submitting}
          autoComplete="address-line1"
          required
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          Address line 2
        </span>
        <input
          className={`mt-1 ${inputClass}`}
          value={form.address2}
          onChange={(e) => update("address2", e.target.value)}
          disabled={disabled || submitting}
          autoComplete="address-line2"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            City
          </span>
          <input
            className={`mt-1 ${inputClass}`}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            disabled={disabled || submitting}
            autoComplete="address-level2"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            Province / State
          </span>
          <input
            className={`mt-1 ${inputClass}`}
            value={form.province}
            onChange={(e) => update("province", e.target.value)}
            disabled={disabled || submitting}
            autoComplete="address-level1"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            Country
          </span>
          <input
            className={`mt-1 ${inputClass}`}
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            disabled={disabled || submitting}
            autoComplete="country-name"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            ZIP / Postal code
          </span>
          <input
            className={`mt-1 ${inputClass}`}
            value={form.zip}
            onChange={(e) => update("zip", e.target.value)}
            disabled={disabled || submitting}
            autoComplete="postal-code"
            required
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          Phone
        </span>
        <input
          className={`mt-1 ${inputClass}`}
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          disabled={disabled || submitting}
          autoComplete="tel"
        />
      </label>

      <button
        type="submit"
        disabled={disabled || submitting}
        className="mt-6 w-full bg-black px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-zinc-900 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
