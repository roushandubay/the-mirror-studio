"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { CalendarDays } from "lucide-react";
import ChromeButton from "@/components/ui/ChromeButton";
import MenuOverlay from "@/components/MenuOverlay";
import RollLabel from "@/components/ui/RollLabel";
import { useHeaderTheme } from "@/lib/useHeaderTheme";
import { cn } from "@/lib/cn";
import { HEADER, NAV, SITE } from "@/content/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The fixed header, shared by every page. It used to live inside the homepage
 * hero; it moved out so inner pages get the identical chrome.
 *
 * Measured off the reference: a 45px row with 30px side gutters on desktop,
 * fully transparent, colour following whatever is beneath it. Inner pages add
 * a small centred wordmark so there is always a way home — the homepage does
 * not need it, its hero carries the full logo.
 *
 * Opacity-only entrance: no transform, so nothing here becomes a containing
 * block for the fixed layer.
 */
export default function SiteHeader({ home = false, delay = 0.2 }: { home?: boolean; delay?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // one probe per control, so a row can straddle a dark panel and cream
  const leftTheme = useHeaderTheme(ref, 40, 0.06);
  const theme = useHeaderTheme(ref, 40, 0.5);
  const rightTheme = useHeaderTheme(ref, 40, 0.94);

  return (
    <motion.div
      ref={ref}
      className="fixed inset-x-0 top-0 z-[70] grid grid-cols-[1fr_auto_1fr] items-center px-3 py-3 lg:px-[30px] lg:py-[15px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduced ? 0 : delay, duration: 0.8, ease: EASE }}
    >
      <div className="justify-self-start">
        <MenuOverlay
          label={HEADER.menuLabel}
          links={NAV}
          address={SITE.address}
          instagram={SITE.instagram}
          feature={HEADER.feature}
          tone={leftTheme}
        />
      </div>

      {!home ? (
        <Link
          href="/"
          aria-label={`${SITE.name} — home`}
          className={cn(
            "group justify-self-center font-display text-[15px] uppercase leading-none tracking-[0.34em] transition-colors duration-300 lg:text-[17px]",
            theme === "light" ? "text-[#f8f8f8] drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]" : "text-ink",
          )}
        >
          <RollLabel marker={null}>{SITE.shortName}</RollLabel>
        </Link>
      ) : (
        <span />
      )}

      <Link href={HEADER.cta.href} aria-label={HEADER.cta.label} className="justify-self-end">
        <ChromeButton
          icon={<CalendarDays size={18} strokeWidth={1.5} />}
          label={HEADER.cta.label}
          tone={rightTheme}
        />
      </Link>
    </motion.div>
  );
}
