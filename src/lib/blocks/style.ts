import type { CSSProperties } from "react";
import type { BlockStyle } from "./types";

/** Token names the admin's colour picker may emit instead of a raw hex. */
const TOKENS = new Set([
  "primary",
  "primary-25",
  "primary-100",
  "primary-200",
  "primary-600",
  "primary-700",
  "primary-750",
  "primary-800",
  "primary-900",
  "ink",
  "ink-soft",
  "muted",
  "muted-2",
  "line",
  "line-2",
  "canvas",
]);

/** "primary-750" -> var(--color-primary-750); "#fff" -> "#fff" */
export function resolveColor(value?: string): string | undefined {
  if (!value) return undefined;
  return TOKENS.has(value) ? `var(--color-${value})` : value;
}

/**
 * Turns a block's CMS style overrides into an inline style object. Only keys
 * the editor actually set are emitted, so the component's Figma defaults
 * survive untouched.
 */
export function blockStyle(style?: BlockStyle): CSSProperties {
  if (!style) return {};
  const out: CSSProperties = {};
  const bg = resolveColor(style.background);
  const fg = resolveColor(style.color);
  if (bg) out.background = bg;
  if (fg) out.color = fg;
  if (style.paddingTop != null) out.paddingTop = style.paddingTop;
  if (style.paddingBottom != null) out.paddingBottom = style.paddingBottom;
  if (style.fontFamily) out.fontFamily = style.fontFamily;
  if (style.fontWeight != null) out.fontWeight = style.fontWeight;
  if (style.align) out.textAlign = style.align;
  // Consumed by child rules as calc(<base> * var(--block-font-scale))
  if (style.fontScale != null) {
    (out as Record<string, unknown>)["--block-font-scale"] = String(style.fontScale);
  }
  if (style.radius != null) {
    (out as Record<string, unknown>)["--block-radius"] = `${style.radius}px`;
  }
  return out;
}

/** Content-well width override, used by the inner container of each block. */
export function wellStyle(style?: BlockStyle): CSSProperties {
  return style?.maxWidth != null ? { maxWidth: style.maxWidth } : {};
}

/**
 * Grid overrides for the card blocks. Columns are emitted as a CSS custom
 * property rather than as grid-template-columns directly: an inline
 * grid-template-columns would outrank every responsive utility class, forcing
 * the desktop column count onto phones too.
 */
export function gridStyle(style?: BlockStyle, fallbackCols = 3): CSSProperties {
  return {
    ["--cols" as string]: String(style?.columns ?? fallbackCols),
    gap: style?.gap ?? 24,
  } as CSSProperties;
}
