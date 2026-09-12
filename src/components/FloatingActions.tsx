"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import { getLenis } from "@/lib/scroll";

/**
 * Figma floating cluster (bottom-right, 152x112): a back-to-top control above a
 * chat FAB. The chat button opens WhatsApp, which is how a Siliguri studio
 * actually takes enquiries.
 */
export default function FloatingActions({
  whatsapp = "910000000000",
  message = "Hi! I would like to book an appointment at The Mirror.",
}: {
  whatsapp?: string;
  message?: string;
}) {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 600));

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {show && (
          <motion.button
            key="top"
            type="button"
            aria-label="Back to top"
            // Lenis re-applies its own target every frame, so window.scrollTo is
            // overridden instantly on desktop. Go through Lenis when it is running.
            onClick={() => {
              const lenis = getLenis();
              if (lenis) lenis.scrollTo(0, { duration: 1.4 });
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.8 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden={false}
          >
            <GlassPanel tone="dark" className="h-11 w-11 text-ink">
              <ArrowUp size={16} strokeWidth={1.5} />
            </GlassPanel>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Chat with us on WhatsApp"
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassPanel tone="dark" className="h-11 w-11 text-ink">
          <MessageCircle size={16} strokeWidth={1.5} />
        </GlassPanel>
      </motion.a>
    </div>
  );
}
