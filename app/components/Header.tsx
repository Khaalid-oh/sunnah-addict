"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SearchOverlay from "./SearchOverlay";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const { customer, loading } = useAuth();
  const { cartCount, setCartOpen, refreshCart } = useCart();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:h-24 lg:gap-8 lg:px-8">
        <div className="flex w-10 shrink-0 items-center lg:justify-center">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-zinc-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 shrink-0 items-center lg:static lg:translate-x-0"
            aria-label="Sunnah Addict Home"
            onClick={closeMenu}
          >
            <Image
              src="/_logo.svg"
              alt="Sunnah Addict Logo"
              width={72}
              height={72}
              className="h-18 w-18 object-contain sm:h-20 sm:w-20 xl:h-[80px] xl:w-[80px]"
              quality={100}
            />
          </Link>
        </div>

        <nav
          className="hidden justify-center gap-8 lg:flex"
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 lg:hidden"
            aria-label="Open search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 lg:hidden"
            aria-label={`Cart, ${cartCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden w-52 items-center gap-2 border border-zinc-100 bg-zinc-100 px-4 py-2.5 pr-10 text-left text-sm text-zinc-500 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black lg:flex xl:w-64"
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
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative hidden h-10 w-10 shrink-0 items-center justify-center text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 lg:flex"
            aria-label={`Cart, ${cartCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
          {!loading && (
            <>
              {customer ? (
                <>
                  <Link
                    href="/account"
                    className="relative hidden h-10 w-10 shrink-0 items-center justify-center text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 lg:flex"
                    aria-label="Account"
                    onClick={closeMenu}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                  <a
                    href="/api/auth/logout"
                    className="hidden text-sm font-medium uppercase tracking-widest text-zinc-600 transition hover:text-black lg:inline"
                  >
                    Log out
                  </a>
                </>
              ) : (
                <a
                  href="/api/auth/login"
                  className="relative hidden h-10 w-10 shrink-0 items-center justify-center text-zinc-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 lg:flex"
                  aria-label="Log in"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-hidden
            onClick={closeMenu}
          />
          <div
            className="fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] border-r border-zinc-200 bg-white shadow-xl lg:hidden"
            role="dialog"
            aria-label="Mobile menu"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
              <span className="text-sm font-medium uppercase tracking-widest text-zinc-900">
                Menu
              </span>
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-10 w-10 items-center justify-center text-zinc-500 hover:text-zinc-900"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col py-4" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    className={`px-4 py-3 text-sm font-medium uppercase tracking-widest transition hover:bg-zinc-50 ${
                      isActive
                        ? "border-l-2 border-black bg-zinc-50 text-black"
                        : "border-l-2 border-transparent text-zinc-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-zinc-200" />
              {!loading && (
                <>
                  {customer ? (
                    <>
                      <Link
                        href="/account"
                        onClick={closeMenu}
                        className="border-l-2 border-transparent px-4 py-3 text-sm font-medium uppercase tracking-widest text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Account
                      </Link>
                      <a
                        href="/api/auth/logout"
                        className="border-l-2 border-transparent px-4 py-3 text-sm font-medium uppercase tracking-widest text-zinc-600 transition hover:bg-zinc-50"
                      >
                        Log out
                      </a>
                    </>
                  ) : (
                    <a
                      href="/api/auth/login"
                      className="border-l-2 border-transparent px-4 py-3 text-sm font-medium uppercase tracking-widest text-zinc-700 transition hover:bg-zinc-50"
                    >
                      Log in
                    </a>
                  )}
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
