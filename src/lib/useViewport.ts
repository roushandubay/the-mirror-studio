"use client";

import { useEffect, useState } from "react";

/**
 * Single source of truth for "are we on a narrow screen".
 *
 * Starts as `null` rather than a guess so the first client render matches the
 * server output — picking a default here would cause a hydration mismatch and a
 * visible flash of the wrong asset.
 */
export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);

  return isMobile;
}
