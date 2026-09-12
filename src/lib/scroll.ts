import type Lenis from "lenis";

/**
 * Module-level handle on the one Lenis instance, so UI that must pause page
 * scrolling (the menu overlay) can do it properly. Setting `overflow: hidden`
 * on <body> is not enough — Lenis drives the scroll itself and ignores it.
 */
let instance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}
