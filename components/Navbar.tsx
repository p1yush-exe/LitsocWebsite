"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MagnetWrap from "@/app/(main)/utility/MagnetWrap";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events", external: true },
  { label: "Our Team",  href: "/team",    external: true },
  { label: "Gallery",   href: "/gallery", external: true },
  { label: "About", href: "/", scrollTo: "about" },
];

type CtaConfig = { label: string; href: string; external?: boolean };

const CTA_SECTIONS: { id: string; config: CtaConfig }[] = [
  { id: "events-carousel", config: { label: "GALLERY",      href: "/gallery",    external: true } },
  { id: "calendar",        config: { label: "EVENTS",       href: "/events",     external: true } },
  { id: "about",           config: { label: "GET INVOLVED", href: "/engagement", external: true } },
];
const DEFAULT_CTA: CtaConfig = { label: "GET INVOLVED", href: "/engagement", external: true };

export default function Navbar() {
  const router = useRouter();
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ctaConfig, setCtaConfig] = useState<CtaConfig>(DEFAULT_CTA);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const NAVBAR_H = 56;

    const updateCta = () => {
      // A section is "active" when it's currently visible in the viewport:
      // its top has entered the viewport (top <= viewport bottom)
      // AND its bottom hasn't left past the navbar (bottom >= NAVBAR_H).
      let matched: CtaConfig = DEFAULT_CTA;

      for (const { id, config } of CTA_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top, bottom } = el.getBoundingClientRect();
        const inView = top <= window.innerHeight && bottom >= NAVBAR_H;
        if (inView) {
          matched = config;
          break; // use the first visible section (top-most in page order)
        }
      }

      setCtaConfig((prev) =>
        prev.label === matched.label ? prev : matched
      );
    };

    window.addEventListener("scroll", updateCta, { passive: true });
    updateCta();
    return () => window.removeEventListener("scroll", updateCta);
  }, []);

  const scrollToSection = (id: string) => {
    setDesktopMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-40 w-full bg-milk transition-[border-color,box-shadow] duration-300 ${
          scrolled ? "border-b border-red-brown/20 shadow-sm" : "border-b border-transparent shadow-none"
        }`}
      >
        <div className="relative z-20 flex h-14 w-full items-center justify-between px-6 md:px-8 lg:px-10 py-10">
          {/* Logo + brand name */}
          <MagnetWrap strength={0.25} radius={80}>
            <Link href="/" className="flex items-center gap-0">
              <Image src="/logo.png" alt="LitSoc Logo" width={100} height={100} className="rounded-full" />
              <span className="hidden md:inline text-3xl font-black uppercase leading-none py-2 text-dark-brown font-antonio tracking-[-0.02em] select-none whitespace-nowrap">
                Literary Society, TIET
              </span>
            </Link>
          </MagnetWrap>

          {/* ── Desktop: two-line hamburger centred ── */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
            <MagnetWrap strength={0.35} radius={60}>
              <button
                onClick={() => setDesktopMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                className="flex flex-col items-center justify-center gap-1.75 p-2 group"
              >
                <span
                  className={`block h-0.5 w-7 bg-dark-brown origin-center transition-transform duration-300 ${
                    desktopMenuOpen ? "translate-y-[4.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-7 bg-dark-brown origin-center transition-transform duration-300 ${
                    desktopMenuOpen ? "-translate-y-[4.5px] -rotate-45" : ""
                  }`}
                />
              </button>
            </MagnetWrap>
          </div>

          {/* ── Scroll-aware CTA pill ── */}
          <MagnetWrap strength={0.3} radius={70}>
            <Link
              href={ctaConfig.href}
              target={ctaConfig.external ? "_blank" : undefined}
              rel={ctaConfig.external ? "noopener noreferrer" : undefined}
              className="relative rounded-full border border-dark-brown px-1 py-2 text-2xl font-black uppercase tracking-[-0.02em] font-antonio text-dark-brown transition-colors duration-200 hover:bg-dark-brown hover:text-milk overflow-hidden flex items-center justify-center"
              style={{ minWidth: "9.5rem" }}
            >
              {/* pulse flash on label change */}
              <AnimatePresence>
                <motion.span
                  key={ctaConfig.label + "-flash"}
                  className="pointer-events-none absolute inset-0 rounded-full"
                  initial={{ backgroundColor: "var(--dark-brown-35)" }}
                  animate={{ backgroundColor: "var(--dark-brown-0)" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </AnimatePresence>
              {/* invisible anchor keeps width locked to longest label */}
              <span className="invisible select-none pointer-events-none absolute">GET INVOLVED</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={ctaConfig.label}
                  className="flex justify-center"
                  initial="enter"
                  animate="visible"
                  exit="exit"
                >
                  {ctaConfig.label.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      style={{ display: "inline-block" }}
                      variants={{
                        enter:   { y: "110%", opacity: 0 },
                        visible: { y: 0,      opacity: 1, transition: { delay: i * 0.028, duration: 0.22, ease: "easeOut" } },
                        exit:    { y: "-110%", opacity: 0, transition: { delay: i * 0.018, duration: 0.16, ease: "easeIn"  } },
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </Link>
          </MagnetWrap>
        </div>

        {/* ── Desktop dropdown panel ── */}
        <AnimatePresence>
          {desktopMenuOpen && (
            <motion.div
              key="desktop-menu"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
              className="absolute top-full left-0 hidden w-full bg-milk border-b border-red-brown/20 shadow-lg md:block z-10"
            >
              <motion.div
                className="flex w-full items-center justify-between px-10 lg:px-20 py-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.18 }}
              >
                {navLinks.map((link) => (
                  <div key={link.label}>
                    {link.scrollTo ? (
                      <button
                        className="font-antonio font-black uppercase tracking-[-0.02em] whitespace-nowrap text-2xl text-dark-brown hover:opacity-60 transition-opacity"
                        onClick={() => scrollToSection(link.scrollTo!)}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="font-antonio font-black uppercase tracking-[-0.02em] whitespace-nowrap text-2xl text-dark-brown hover:opacity-60 transition-opacity"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}