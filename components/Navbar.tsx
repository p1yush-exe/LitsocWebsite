"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Events",
    href: "#",
    dropdown: [
      { label: "Upcoming Events", href: "#" },
      { label: "Past Events", href: "#" },
    ],
  },
  {
    label: "Our Team",
    href: "#",
    dropdown: [
      { label: "Core Team", href: "#" },
      { label: "Faculty Advisors", href: "#" },
    ],
  },
  { label: "Get Involved", href: "#" },
  { label: "About", href: "#" },
];

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        atTop
          ? "border-b border-transparent bg-[#FAF8F5] shadow-none"
          : "border-b border-gray-200/70 bg-[#FAF8F5]/95 shadow-sm backdrop-blur-sm"
      }`}
    >
      <div className="relative z-10 mx-1 flex h-14 max-w-screen-xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="LitSoc Logo" width={50} height={50} className="rounded-full" />

          {/* Brand name in Lato */}
          <span className="text-lg py-2 font-semibold tracking-wide text-gray-900 font-lato">
            Literary Society, TIET
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="relative">
                <button
                  onClick={() => toggleDropdown(link.label)}
                  className="flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-950"
                >
                  {link.label}
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${
                      openDropdown === link.label ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDropdown === link.label && (
                  <div className="absolute left-0 top-full mt-1 min-w-[160px] rounded-md border border-gray-200 bg-[#FAF8F5]/98 py-1 shadow-lg backdrop-blur-sm">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-950"
              >
                {link.label}
              </Link>
            )
          )}

          {/* Search icon */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="ml-2 rounded p-1.5 text-gray-500 transition-colors hover:text-gray-900"
            aria-label="Search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1 p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-gray-800 transition-transform duration-200 ${mobileMenuOpen ? "translate-y-1.5 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-gray-800 transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-gray-800 transition-transform duration-200 ${mobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="relative z-10 border-t border-gray-200 bg-[#FAF8F5]/98 px-6 py-3 md:hidden">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-950"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
              {link.dropdown && (
                <div className="pl-4">
                  {link.dropdown.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block py-1.5 text-sm text-gray-500 hover:text-gray-950"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
