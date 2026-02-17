"use client";

import Image from "next/image";
import Link from "next/link";

const CUSTOMER_CARE_LINKS = [
  "Payment Options",
  "Delivery",
  "Returns",
  "Billing",
  "Privacy Policy",
];

const INFO_LINKS = ["Sustainability", "Our Story", "FAQs"];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col">
            <Link
              href="/"
              className="flex shrink-0 items-center sm:mb-2"
              aria-label="Sunnah Addict Home"
            >
              <Image
                src="/_logo.svg"
                alt="Sunnah Addict Logo"
                width={100}
                height={100}
                quality={100}
                className="h-18 w-18 object-contain sm:h-16 sm:w-16 lg:h-8 lg:w-20"
              />
            </Link>
            <p className="mb-1 sm:mb-4 text-sm leading-6 text-zinc-600">
              Sign up to receive regular updates, latest offers and more!
            </p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="max-w-fit bg-black px-6 py-3 text-xs uppercase tracking-wider text-white transition hover:bg-zinc-800"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-black">
              Customer Care
            </h3>
            <ul className="space-y-2">
              {CUSTOMER_CARE_LINKS.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm text-zinc-700 hover:text-black hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-black">
              Info
            </h3>
            <ul className="space-y-2">
              {INFO_LINKS.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm text-zinc-700 hover:text-black hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-black">
              Contact Us
            </h3>
            <p className="text-sm text-zinc-700">hello@sunnah-addict.com</p>
            <p className="mt-1 text-sm text-zinc-700">
              Cumbelco 6, 02005 Abuja, Nigeria
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://x.com/sunnah_addict"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-black"
                aria-label="X (Twitter)"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/addictsunnah/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-black"
                aria-label="Instagram"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.18 3.185a1.44 1.44 0 110 2.88 1.44 1.44 0 010-2.88z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://pin.it/4k62y0CS7"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-black"
                aria-label="Pinterest"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@sunnah_addict"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-black"
                aria-label="TikTok"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1.05-.08 6.33 6.33 0 00-6.33 6.33 6.33 6.33 0 0010.88 4.43v-6.1a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
