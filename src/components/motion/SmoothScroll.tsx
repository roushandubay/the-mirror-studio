"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cancelFrame, frame, type FrameData } from "motion/react";
import Lenis from "lenis";
import { getLenis, registerLenis } from "@/lib/scroll";

/**
 * Lenis drives the page scroll for the whole site. Mounted once in the root
 * layout, so it survives client-side navigation. Bails out entirely when the
 * visitor asks for reduced motion, so the browser's native scrolling takes
 * over untouched.
 *
 * Lenis is ticked from Motion's own frame loop rather than a second
 * requestAnimationFrame. With two loops, a scroll-linked transform could read
 * the scroll position from one frame and paint in the next — a one-frame
 * wobble on pinned and parallax sections. On one loop, the scroll update and
 * every useScroll-driven style land in the same frame.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const first = useRef(true);

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
      // In-page links (#course) glide, clearing the fixed header
      anchors: { offset: -90 },
      // Clicking a link mid-glide should not keep coasting on the next page
      stopInertiaOnNavigate: true,
      // Scrollable panels (the menu overlay, data-lenis-prevent) scroll natively
      allowNestedScroll: true,
      autoRaf: false,
    });
    registerLenis(lenis);

    // Lenis re-applies its own scroll target every frame, so a plain
    // window.scrollTo is overridden immediately. Expose the instance in
    // development so scripted checks (and devtools) can drive it properly.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const update = (data: FrameData) => lenis.raf(data.timestamp);
    frame.update(update, true);

    return () => {
      cancelFrame(update);
      if (process.env.NODE_ENV !== "production") {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  // New page: start at the top, and re-measure — the document height changed
  // under Lenis. Next's own scroll reset is overridden by Lenis's target, so it
  // has to happen here.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const lenis = getLenis();
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.resize();
    // Blocks mount images and pins after this frame; measure again once settled
    const t = window.setTimeout(() => lenis.resize(), 400);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
