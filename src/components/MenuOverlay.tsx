"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import ChromeButton from "@/components/ui/ChromeButton";
import GlassPanel from "@/components/ui/GlassPanel";
import { DisplayStatic } from "@/components/ui/DisplayLine";
import type { LinkRef } from "@/lib/blocks/types";
import { getLenis } from "@/lib/scroll";
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

type Feature = { eyebrow: string; title: string; href: string; cta: string };

/**
 * The MENU trigger and the full-screen navigation overlay.
 *
 * The overlay is portalled to <body>. Rendered in place it inherited the
 * header's stacking context, opacity and any entrance transform — which is how
 * it ended up opening invisibly on desktop while still locking the page.
 *
 * The first link is the studio's headline offer, and it is also repeated as a
 * glass feature card beside the list, so it is the first thing seen on open.
 */
export default function MenuOverlay({
  label = "Menu",
  links = [],
  address,
  instagram,
  feature,
  tone = "light",
}: {
  label?: string;
  links?: LinkRef[];
  address?: string;
  instagram?: string;
  feature?: Feature;
  /** trigger colour, driven by what the fixed header is over */
  tone?: "light" | "dark";
}) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
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
                data-lenis-prevent
                className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-primary-900/95"
                style={{ backdropFilter: "blur(28px) saturate(160%)" }}
                initial={{ clipPath: reduced ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: reduced ? "inset(0 0 0 0)" : "inset(100% 0 0 0)", transition: { duration: 0.6, ease: EASE } }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="flex items-center justify-end px-3 py-3 lg:px-[30px] lg:py-[15px]">
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                    <ChromeButton icon={<CloseIcon size={18} strokeWidth={1.5} />} label="Close" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-10 px-6 pb-6 lg:flex-row lg:items-center lg:gap-16 lg:px-16">
                  <nav className="flex flex-1 flex-col justify-center gap-0.5">
                    {links.map((l, i) => {
                      const active = pathname === l.href;
                      return (
                        <motion.div
                          key={l.href + l.label}
                          initial={{ opacity: 0, y: 28 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12, transition: { duration: 0.25, ease: EASE } }}
                          transition={{ delay: reduced ? 0 : 0.18 + i * 0.045, duration: 0.7, ease: EASE }}
                        >
                          <Link
                            href={l.href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className="group flex items-baseline gap-4 py-0.5 text-white"
                          >
                            <span className="w-8 shrink-0 text-overline tracking-[0.2em] text-white/40">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={cn(
                                "font-display text-[clamp(26px,3.6vw,54px)] uppercase leading-[1.1] transition-[opacity,letter-spacing] duration-500 group-hover:tracking-[0.04em] group-hover:opacity-60",
                                active && "italic lowercase text-primary-100",
                                i === 0 && !active && "text-primary-100",
                              )}
                            >
                              {l.label}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>

                  {feature && (
                    <motion.div
                      className="w-full lg:w-[380px]"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ delay: reduced ? 0 : 0.45, duration: 0.9, ease: EASE }}
                    >
                      <Link href={feature.href} onClick={() => setOpen(false)} className="block">
                        <GlassPanel className="flex-col items-start p-8 text-left text-white" radius={30}>
                          <span className="flex w-full flex-col items-start gap-5">
                            <span className="text-overline uppercase tracking-[0.24em] text-primary-100">
                              {feature.eyebrow}
                            </span>
                            <DisplayStatic
                              as="span"
                              text={feature.title}
                              className="block font-display text-[clamp(34px,3vw,46px)] font-light leading-[1.02]"
                            />
                            <span className="flex items-center gap-2 text-body-sm uppercase tracking-[0.16em] text-white/80">
                              {feature.cta} <ArrowUpRight size={16} strokeWidth={1.5} />
                            </span>
                          </span>
                        </GlassPanel>
                      </Link>
                    </motion.div>
                  )}
                </div>

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
