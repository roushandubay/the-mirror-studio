import type { CSSProperties } from "react";
import { resolveColor } from "./style";
import type { MediaAdjust, MediaRef } from "./types";

/**
 * Turns a MediaAdjust into the two things it needs to render:
 *
 *   filterStyle() — a CSS `filter`, applied to the pixels themselves
 *   shadeStyle()  — an overlay layer for darkness / colour wash
 *
 * Darkness is deliberately NOT a brightness filter. Dropping brightness crushes
 * the highlights and makes footage look muddy; a black overlay leaves the
 * specular intact, which is what you want over video.
 */

/** CSS `filter` for the asset, or undefined when nothing is set. */
export function filterStyle(adjust?: MediaAdjust): CSSProperties {
  if (!adjust) return {};
  const parts: string[] = [];
  if (adjust.brightness != null && adjust.brightness !== 1) {
    parts.push(`brightness(${adjust.brightness})`);
  }
  if (adjust.contrast != null && adjust.contrast !== 1) {
    parts.push(`contrast(${adjust.contrast})`);
  }
  if (adjust.saturation != null && adjust.saturation !== 1) {
    parts.push(`saturate(${adjust.saturation})`);
  }
  if (adjust.blur) parts.push(`blur(${adjust.blur}px)`);
  return parts.length ? { filter: parts.join(" ") } : {};
}

/** True when the asset needs an overlay layer drawn over it. */
export function hasShade(adjust?: MediaAdjust) {
  if (!adjust) return false;
  return Boolean(adjust.darkness) || Boolean(adjust.shade && adjust.shadeAmount);
}

/**
 * Style for the overlay layer. Render it as an absolutely positioned,
 * pointer-events-none sibling stacked directly over the asset.
 */
export function shadeStyle(adjust?: MediaAdjust): CSSProperties {
  if (!adjust) return {};
  const layers: string[] = [];
  if (adjust.darkness) {
    layers.push(
      `linear-gradient(rgba(0,0,0,${adjust.darkness}), rgba(0,0,0,${adjust.darkness}))`,
    );
  }
  if (adjust.shade && adjust.shadeAmount) {
    const c = resolveColor(adjust.shade) ?? adjust.shade;
    layers.push(`linear-gradient(${c}, ${c})`);
  }
  if (!layers.length) return {};
  return {
    backgroundImage: layers.join(", "),
    opacity: adjust.shade && adjust.shadeAmount && !adjust.darkness ? adjust.shadeAmount : 1,
    mixBlendMode: adjust.shade && adjust.shadeAmount ? "multiply" : undefined,
  };
}

/** Convenience: both halves for a MediaRef in one call. */
export function grade(media?: MediaRef) {
  return {
    filter: filterStyle(media?.adjust),
    shade: shadeStyle(media?.adjust),
    hasShade: hasShade(media?.adjust),
  };
}
