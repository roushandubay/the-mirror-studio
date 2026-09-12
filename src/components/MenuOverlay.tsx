"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import ChromeButton from "@/components/ui/ChromeButton";
import type { LinkRef } from "@/lib/blocks/types";
import { getLenis } from "@/lib/scroll";

const EASE = [0.22, 1, 0.36, 1] as const;

const DEFAULT_LINKS: LinkRef[] = [
  { label: "Bridal", href: "/services/bridal" },
  { label: "Hair & Salon", href: "/services/hair" },
  { label: "Skin & Beauty", href: "/services/beauty" },
  { label: "Academy", href: "/academy" },
  { label: "The Studio", href: "/studio" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

/**
 * The MENU trigger and the full-screen navigation overlay.
 *
 * The overlay is portalled to <body>. Rendered in place it inherited the
 * header's stacking context, opacity and any entrance transform — which is how
 * it ended up opening invisibly on desktop while still locking the page.
 */
export default function MenuOverlay({
  label = "Menu",
  links = DEFAULT_LINKS,
  address,
  instagram,
  tone = "light",
}: {
  label?: string;
  links?: LinkRef[];
  address?: string;
  instagram?: string;
  /** trigger colour, driven by what the fixed header is over */
  tone?: "light" | "dark";
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pause page scrolling and honour Escape while the overlay is up. Lenis
  // drives the scroll itself, so it has to be stopped directly — body
  // overflow alone does not hold it.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label}
      >
        <ChromeButton icon={<MenuIcon size={18} strokeWidth={1.5} />} label={label} tone={tone} />
      </button>

      {mounted &&
        createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[80] flex flex-col bg-primary-900/95"
            style={{ backdropFilter: "blur(28px) saturate(160%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.05, ease: EASE } }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex items-center justify-end px-6 py-6 lg:px-10">
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <ChromeButton icon={<CloseIcon size={18} strokeWidth={1.5} />} label="Close" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-1 px-6 lg:px-16">
              {links.map((l, i) => (
                <motion.div
                  key={l.href + l.label}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.25, ease: EASE } }}
                  transition={{
                    delay: reduced ? 0 : 0.1 + i * 0.055,
                    duration: 0.7,
                    ease: EASE,
                  }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 py-1 text-white"
                  >
                    <span className="w-8 shrink-0 text-overline tracking-[0.2em] text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-d4 uppercase leading-[1.1] transition-opacity duration-300 group-hover:opacity-60">
                      {l.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-8 text-body-sm text-white/60 lg:px-16">
              {address && <span>{address}</span>}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="uppercase tracking-[0.18em] transition-colors hover:text-white"
                >
                  Instagram
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
