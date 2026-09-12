"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import type { PostItem } from "@/lib/blocks/types";

/**
 * Figma "blog card" (392x474): 294px image, 24px gap, then a 24px-guttered
 * text well — H5 title, an overline meta row separated by hairlines, and a
 * 64px-clamped excerpt.
 */
export default function BlogCard({ item, className }: { item: PostItem; className?: string }) {
  const reduced = useReducedMotion();
  const meta = [item.category, item.author, item.date].filter(Boolean) as string[];

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex h-full w-full flex-col items-center gap-6 border border-line-2 bg-white pb-6",
        "transition-shadow duration-500 hover:shadow-[0_18px_50px_-24px_rgba(161,5,80,0.45)]",
        className,
      )}
    >
      <div className="relative h-[294px] w-full shrink-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          whileHover={reduced ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={item.image.src}
            alt={item.image.alt ?? item.title}
            fill
            sizes="(max-width: 768px) 90vw, 392px"
            className="object-cover"
            style={{ objectPosition: item.image.focal ?? "50% 50%" }}
          />
        </motion.div>
      </div>

      <div className="flex w-full flex-col justify-center gap-4 px-6">
        <div className="flex w-full flex-col justify-center gap-2">
          <h3 className="text-h5 font-bold text-ink transition-colors duration-300 group-hover:text-primary">
            {item.title}
          </h3>
          {meta.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-overline font-semibold tracking-[0.8px] text-muted">
              {meta.map((m, i) => (
                <span key={m} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden className="h-4 w-px bg-line" />}
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
        {item.excerpt && (
          <p className="h-16 overflow-hidden text-ellipsis text-body-md capitalize text-ink">
            {item.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
