"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis } from "@/lib/scroll";

/**
 * Lenis drives the page scroll for the whole site. Mounted once in the root
 * layout. Bails out entirely when the visitor asks for reduced motion, so the
 * browser's native scrolling takes over untouched.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const lenis = new Lenis({
      // lerp rather than a fixed duration: each frame closes a fraction of the
      // distance to the target, so rapid wheel input blends into one continuous
      // glide instead of restarting a timed ease on every tick.
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      // Phones and tablets keep their native momentum scrolling — it is already
      // perfectly smooth, and re-simulating it in JS is what makes touch jank.
      syncTouch: false,
    });
    registerLenis(lenis);

    // Lenis re-applies its own scroll target every frame, so a plain
    // window.scrollTo is overridden immediately. Expose the instance in
    // development so scripted checks (and devtools) can drive it properly.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Let in-page anchors keep working
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -120 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(frame);
      if (process.env.NODE_ENV !== "production") {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
