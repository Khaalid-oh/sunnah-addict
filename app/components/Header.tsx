"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchOverlay from "./SearchOverlay";
import { useAuth } from "../contexts/AuthContext";

const NAV_LINKS = [
  { label: "ALL", href: "/" },
  { label: "WOMEN", href: "/women" },
  { label: "MEN", href: "/men" },
  { label: "KIDS", href: "/kids" },
  { label: "BRANDS", href: "/brands" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "SALE", href: "/sale" },
];

export default function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { customer, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Sunnah Addict Home"
        >
          <Image
            src="/_logo.svg"
            alt="Sunnah Addict Logo"
            width={100}
            height={100}
          />
        </Link>

        <nav
          className="hidden flex-1 justify-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-widest text-black transition hover:opacity-80 ${
                  isActive
                    ? "underline decoration-black underline-offset-4"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {customer ? (
                <>
                  <Link
                    href="/account"
                    className="text-sm font-medium uppercase tracking-widest text-black transition hover:opacity-80"
                  >
                    Account
                  </Link>
                  <a
                    href="/api/auth/logout"
                    className="text-sm font-medium uppercase tracking-widest text-zinc-600 transition hover:text-black"
                  >
                    Log out
                  </a>
                </>
              ) : (
                <a
                  href="/api/auth/login"
                  className="text-sm font-medium uppercase tracking-widest text-black transition hover:opacity-80"
                >
                  Log in
                </a>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex w-64 items-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2.5 pr-10 text-left text-sm text-zinc-500 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:w-52"
            aria-label="Open search"
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-zinc-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span>Search...</span>
          </button>
        </div>
      </div>
    </header>
  );
}
