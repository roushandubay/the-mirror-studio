"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { filterStyle, hasShade, shadeStyle } from "@/lib/blocks/media";
import type { MediaRef } from "@/lib/blocks/types";

/**
 * Fills a box with a MediaRef, honouring the asset's own `fit`.
 *
 * `cover` (default) crops to fill — correct when the source is at least as big
 * as the box.
 *
 * `contain` is for the case this project actually has: a portrait phone still
 * (360px wide) dropped into a wide landscape panel. Covering it there means
 * upscaling roughly 5x, which is exactly what reads as "the image is zoomed
 * in". Instead the sharp picture is shown whole at its natural proportions,
 * over a blurred, over-scaled copy of itself that fills the remaining space —
 * the standard treatment for portrait footage on a landscape stage, and it
 * looks deliberate rather than broken.
 *
 * The real fix is a landscape source for desktop: set `srcMobile` for phones
 * and `src` for desktop, then switch `fit` back to cover.
 */
export default function MediaFill({
  media,
  src,
  fit,
  alt,
  sizes = "100vw",
  priority,
  loading,
  className,
  style,
}: {
  media: MediaRef;
  /** resolved source (caller decides desktop vs mobile) */
  src: string;
  /** resolved fit (caller decides desktop vs mobile) */
  fit?: "cover" | "contain";
  alt?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  className?: string;
  style?: CSSProperties;
}) {
  const contain = (fit ?? media.fit) === "contain";
  const objectPosition = media.focal ?? "50% 50%";
  const filter = filterStyle(media.adjust);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, ...style }}>
      {contain && (
        // Blurred, over-scaled backdrop so the letterbox never reads as empty
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          priority={priority}
          loading={loading}
          className="scale-110 object-cover blur-2xl"
          style={{ objectPosition, opacity: 0.55 }}
        />
      )}

      <Image
        src={src}
        alt={alt ?? media.alt ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        loading={loading}
        className={contain ? "object-contain" : "object-cover"}
        style={{ objectPosition, ...filter }}
      />

      {hasShade(media.adjust) && (
        <div aria-hidden className="absolute inset-0" style={shadeStyle(media.adjust)} />
      )}
    </div>
  );
}
