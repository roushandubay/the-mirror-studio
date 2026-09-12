"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { blockStyle } from "@/lib/blocks/style";
import type { FooterBlock as Data, LinkRef } from "@/lib/blocks/types";

/**
 * Quiet, airy footer.
 *
 * Everything is left-aligned text on the page's own cream ground — no dark
 * slab, no icon rows, no boxed newsletter. Links carry a small ↗ so they read
 * as navigation without needing borders or chips, and the whole thing stacks
 * into one column on phones in the order a thumb travels: navigate, subscribe,
 * follow, legal.
 */
export default function FooterBlock({ block }: { block: Data }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const primary = block.columns[0];
  const secondary = block.columns[1];

  return (
    <footer
      className="w-full bg-canvas text-ink"
      style={blockStyle(block.style)}
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 pb-28 pt-24 lg:px-16 lg:pb-16 lg:pt-32">
        <Reveal group anim={{ stagger: 0.08 }}>
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr_1.4fr] lg:gap-20">
            {/* primary navigation */}
            <RevealItem duration={0.7}>
              <ul className="flex flex-col gap-3">
                {primary?.links.map((l) => (
                  <li key={l.href + l.label}>
                    <FooterLink link={l} size="lg" />
                  </li>
                ))}
              </ul>
            </RevealItem>

            {/* secondary navigation */}
            <RevealItem duration={0.7}>
              <ul className="flex flex-col gap-3">
                {secondary?.links.map((l) => (
                  <li key={l.href + l.label}>
                    <FooterLink link={l} size="lg" />
                  </li>
                ))}
              </ul>
            </RevealItem>

            {/* newsletter + socials */}
            <RevealItem duration={0.7} className="flex flex-col gap-12">
              {block.newsletter && (
                <div>
                  <p className="mb-5 text-overline uppercase tracking-[0.18em] text-muted">
                    {block.newsletter.heading}
                  </p>
                  <form
                    className="relative max-w-[420px]"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSent(true);
                    }}
                  >
                    <label className="sr-only" htmlFor="footer-email">
                      {block.newsletter.placeholder ?? "Email address"}
                    </label>
                    <input
                      id="footer-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={block.newsletter.placeholder ?? "Email address"}
                      className="w-full border-b border-ink/25 bg-transparent pb-3 pr-10 text-body-md text-ink outline-none transition-colors duration-300 placeholder:text-muted focus:border-ink"
                    />
                    <button
                      type="submit"
                      aria-label={block.newsletter.cta}
                      className="absolute bottom-3 right-0 text-body-md text-ink transition-transform duration-300 hover:translate-x-1"
                    >
                      {sent ? "✓" : "→"}
                    </button>
                  </form>
                </div>
              )}

              {block.socials.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {block.socials.map((s) => (
                    <li key={s.id}>
                      <FooterLink
                        link={{ label: s.label, href: s.href }}
                        size="lg"
                        external
                        muted
                      />
                    </li>
                  ))}
                </ul>
              )}
            </RevealItem>
          </div>
        </Reveal>

        {/* legal */}
        {block.legal && block.legal.length > 0 && (
          <ul className="mt-20 flex flex-col gap-3 lg:mt-28">
            {block.legal.map((l) => (
              <li key={l.href + l.label}>
                <FooterLink link={l} external muted />
              </li>
            ))}
          </ul>
        )}

        {/* contact + credits */}
        <div className="mt-20 flex flex-col gap-2 text-body-sm text-muted lg:mt-28">
          {block.address && <span>{block.address}</span>}
          {block.phone && (
            <a
              href={`tel:${block.phone.replace(/[^+\d]/g, "")}`}
              className="w-fit transition-colors duration-300 hover:text-ink"
            >
              {block.phone}
            </a>
          )}
          {block.copyright && <span className="mt-4">{block.copyright}</span>}
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  link,
  size = "sm",
  external,
  muted,
}: {
  link: LinkRef;
  size?: "sm" | "lg";
  external?: boolean;
  muted?: boolean;
}) {
  const content = (
    <motion.span
      className="inline-flex items-baseline gap-1"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {link.label}
      {external && (
        <span aria-hidden className="text-[0.72em] leading-none">
          ↗
        </span>
      )}
    </motion.span>
  );

  const cls = [
    "inline-block transition-colors duration-300",
    size === "lg" ? "text-body-lg" : "text-body-sm",
    muted ? "text-muted hover:text-ink" : "text-ink hover:text-primary",
  ].join(" ");

  if (external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer noopener" className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls}>
      {content}
    </Link>
  );
}
