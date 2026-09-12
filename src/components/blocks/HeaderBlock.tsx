"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { blockStyle } from "@/lib/blocks/style";
import type { HeaderBlock as HeaderBlockData } from "@/lib/blocks/types";

/**
 * Figma header (1440x107): logo flush to the 108px gutter, nav centred at 16px
 * bold, search + locale pinned right. Sticky behaviour is ours — the bar
 * retracts on scroll-down and drops back in on scroll-up.
 */
export default function HeaderBlock({ block }: { block: HeaderBlockData }) {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    setHidden(y > prev && y > 200 && !open);
  });

  return (
    <motion.header
      data-node-id="2548:10971"
      className={cn(
        "top-0 z-50 w-full border-b border-line-2 bg-white",
        block.sticky !== false && "sticky",
        solid && "shadow-[0_10px_30px_-24px_rgba(12,12,12,0.5)]",
      )}
      style={blockStyle(block.style)}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-[107px] w-full max-w-[1440px] items-center justify-between px-6 lg:px-[108px]">
        <Link href="/" className="relative block h-[59px] w-[120px] shrink-0">
          <Image
            src={block.logo.src}
            alt={block.logo.alt ?? "Home"}
            fill
            priority
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {block.nav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="group relative text-h6 font-bold capitalize text-ink-soft transition-colors duration-300 hover:text-primary"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-primary transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {block.showSearch !== false && (
            <button
              type="button"
              aria-label="Search"
              className="flex items-center justify-center p-2 transition-transform duration-300 hover:scale-110"
            >
              <Image src="/figma/icon-search.svg" alt="" width={24} height={24} />
            </button>
          )}

          {block.showLocale !== false && (
            <>
              <span aria-hidden className="h-6 w-px bg-line-2" />
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-1 p-2 capitalize"
                aria-label="Change language"
              >
                <Image src="/figma/icon-language.svg" alt="" width={24} height={24} />
                <span className="text-body-md text-ink">{block.locale?.split(" ")[0] ?? "US"} </span>
                <span className="text-body-sm text-muted">
                  {block.locale?.split(" ")[1] ?? "(EN)"}
                </span>
              </button>
            </>
          )}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="ml-1 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <motion.span
              className="block h-[2px] w-6 bg-ink"
              animate={{ rotate: open ? 45 : 0, y: open ? 3.5 : 0 }}
            />
            <motion.span
              className="block h-[2px] w-6 bg-ink"
              animate={{ rotate: open ? -45 : 0, y: open ? -3.5 : 0 }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line-2 lg:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {block.nav.map((item, i) => (
                <motion.li
                  key={item.href + item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-h6 font-bold capitalize text-ink-soft"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
