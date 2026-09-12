"use client";

import { useEffect, useState, type RefObject } from "react";

export type HeaderTheme = "light" | "dark";

const MEDIA = /^(IMG|VIDEO|CANVAS)$/;

/**
 * Which colour the fixed header should be, based on what is actually beneath it.
 *
 * Every rendered block is wrapped in an element carrying `data-header-theme`.
 * On scroll we hit-test the viewport just under the header bar, skip the header
 * itself, and read the nearest wrapper's theme. Blocks marked
 * `data-header-media` go light only while a photo, video or canvas is under the
 * bar, so a section that starts pale and fills with imagery switches at the
 * right moment rather than at its top edge.
 *
 * Checks are coalesced into one per animation frame, so this costs nothing
 * while scrolling fast.
 */
export function useHeaderTheme(headerRef: RefObject<HTMLElement | null>, probeY = 40) {
  const [theme, setTheme] = useState<HeaderTheme>("light");

  useEffect(() => {
    let frame = 0;

    const check = () => {
      frame = 0;
      const header = headerRef.current;
      const stack = document.elementsFromPoint(window.innerWidth / 2, probeY);
      const below = stack.filter((el) => !header?.contains(el));
      const host = below
        .map((el) => el.closest<HTMLElement>("[data-header-theme]"))
        .find(Boolean);

      let next: HeaderTheme = (host?.dataset.headerTheme as HeaderTheme) ?? "light";
      if (host?.hasAttribute("data-header-media")) {
        const overMedia = below.some((el) => host.contains(el) && MEDIA.test(el.tagName));
        next = overMedia ? "light" : next;
      }
      setTheme((prev) => (prev === next ? prev : next));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headerRef, probeY]);

  return theme;
}
