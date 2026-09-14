"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Phone } from "lucide-react";
import DisplayLine from "@/components/ui/DisplayLine";
import GlassPanel from "@/components/ui/GlassPanel";
import { blockStyle } from "@/lib/blocks/style";
import { cn } from "@/lib/cn";
import { getLenis } from "@/lib/scroll";
import type { BookingFormBlock as Data } from "@/lib/blocks/types";

const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;

type Answers = {
  service: string;
  date: string;
  flexible: boolean;
  location: string;
  city: string;
  name: string;
  phone: string;
};

const EMPTY: Answers = { service: "", date: "", flexible: false, location: "", city: "", name: "", phone: "" };

/**
 * Booking, in three questions.
 *
 *   1. What are we booking?          — one tap, and it moves on by itself
 *   2. When, and where?              — a date (or "not fixed yet") and studio / India / abroad
 *   3. Who should we speak to?       — a name and a WhatsApp number
 *
 * Nothing else. Outfit, skin type, headcount — all of that is a conversation,
 * and Janvi's team has it on the call. The finished request is handed to
 * WhatsApp pre-written, which is how the studio already confirms bookings, so
 * no request can vanish into an inbox nobody watches.
 *
 * `?service=academy` (or any option value) pre-selects step one and skips it.
 */
export default function BookingFormBlock({ block }: { block: Data }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [a, setA] = useState<Answers>(EMPTY);
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Pre-select from the query string. Read in an effect rather than via
  // useSearchParams so the page stays statically renderable.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("service");
    if (wanted && block.services.some((s) => s.value === wanted)) {
      setA((prev) => ({ ...prev, service: wanted }));
      setStep(1);
    }
  }, [block.services]);

  // Set after mount: "today" on the server can be a different day to the
  // visitor's, which would be a hydration mismatch on the date input's `min`
  const [today, setToday] = useState<string>();
  useEffect(() => {
    const d = new Date();
    setToday(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((prev) => ({ ...prev, [k]: v }));

  const needsCity = a.location !== "" && a.location !== block.locations[0]?.value;
  const valid = [
    a.service !== "",
    a.location !== "" && (a.flexible || a.date !== "") && (!needsCity || a.city.trim().length > 1),
    a.name.trim().length > 1 && a.phone.replace(/\D/g, "").length >= 8,
  ];

  const go = (to: number) => {
    setTouched(false);
    setDir(to > step ? 1 : -1);
    setStep(to);
    // keep the form in view on phones, where the heading sits above it
    const el = formRef.current;
    const lenis = getLenis();
    if (el && el.getBoundingClientRect().top < 0) {
      if (lenis) lenis.scrollTo(el, { offset: -90 });
      else el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const next = () => {
    if (!valid[step]) {
      setTouched(true);
      return;
    }
    if (step < 2) go(step + 1);
    else setDone(true);
  };

  const label = (list: Data["services"], v: string) => list.find((o) => o.value === v)?.label ?? v;

  const message = [
    `Hello THE MIRROR — I'd like to book.`,
    `• Service: ${label(block.services, a.service)}`,
    `• Date: ${a.flexible ? "Not fixed yet" : formatDate(a.date)}`,
    `• Where: ${label(block.locations, a.location)}${needsCity ? ` — ${a.city.trim()}` : ""}`,
    `• Name: ${a.name.trim()}`,
    `• WhatsApp: ${a.phone.trim()}`,
  ].join("\n");
  const waHref = `https://wa.me/${block.whatsapp}?text=${encodeURIComponent(message)}`;

  const QUESTIONS = ["What are we booking?", "When, and where?", "Who should we speak to?"];

  return (
    <section
      id={block.id}
      // the dark panel stops well short of centre, so the header's centred
      // wordmark always sits wholly on cream
      className="relative grid min-h-[100svh] w-full bg-canvas lg:grid-cols-[0.72fr_1.28fr]"
      style={blockStyle(block.style)}
    >
      {/* left: the invitation, over liquid chrome */}
      <div
        data-header-theme="light"
        className="relative overflow-hidden bg-primary-900 px-6 pb-14 pt-28 text-white lg:px-16 lg:pb-16 lg:pt-36"
      >
        <div className="absolute inset-0 opacity-70">
          <SceneCanvas scene="liquid" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/40 to-primary-900/85" />
        <div aria-hidden className="grain pointer-events-none absolute inset-0" />

        <div className="relative flex h-full flex-col">
          <DisplayLine
            as="h1"
            text={block.heading}
            inView={false}
            delay={0.3}
            align="left"
            className="max-w-[11ch] text-d3 font-light leading-[0.98]"
          />
          {block.intro && (
            <motion.p
              className="mt-8 max-w-[40ch] text-body-lg text-white/75"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.9, ease: EASE }}
            >
              {block.intro}
            </motion.p>
          )}

          {block.assurances && (
            <ul className="mt-auto hidden flex-col gap-3 pt-16 lg:flex">
              {block.assurances.map((s, i) => (
                <motion.li
                  key={s}
                  className="flex items-center gap-3 text-body-sm text-white/80"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.8, ease: EASE }}
                >
                  <Check size={16} strokeWidth={1.5} className="text-primary-100" /> {s}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* right: the three questions */}
      <div ref={formRef} className="flex flex-col px-6 py-14 lg:px-20 lg:pb-16 lg:pt-36">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              className="flex flex-1 flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <motion.span
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
              >
                <Check size={28} strokeWidth={1.5} />
              </motion.span>
              <h2 className="mt-8 font-display text-d4 font-light leading-[1.05] text-primary-900">
                {block.successHeading ?? "Almost there."}
              </h2>
              {block.successBody && (
                <p className="mt-5 max-w-[46ch] text-body-md leading-[1.8] text-ink/70">{block.successBody}</p>
              )}

              <dl className="mt-10 grid gap-px overflow-hidden border border-primary-900/10 bg-primary-900/10 sm:grid-cols-2">
                <Summary label="Service" value={label(block.services, a.service)} />
                <Summary label="Date" value={a.flexible ? "Not fixed yet" : formatDate(a.date)} />
                <Summary
                  label="Where"
                  value={`${label(block.locations, a.location)}${needsCity ? ` — ${a.city.trim()}` : ""}`}
                />
                <Summary label="Contact" value={`${a.name.trim()} · ${a.phone.trim()}`} />
              </dl>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a href={waHref} target="_blank" rel="noreferrer noopener">
                  <motion.span className="block" whileHover={reduced ? undefined : { y: -2 }}>
                    <GlassPanel tone="accent" className="h-14 px-8">
                      <span className="flex items-center gap-3 text-body-sm uppercase tracking-[0.16em]">
                        <MessageCircle size={18} strokeWidth={1.5} /> Send on WhatsApp
                      </span>
                    </GlassPanel>
                  </motion.span>
                </a>
                <button type="button" onClick={() => setDone(false)}>
                  <GlassPanel tone="dark" className="h-14 px-6">
                    <span className="text-body-sm uppercase tracking-[0.16em]">Edit details</span>
                  </GlassPanel>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="flex flex-1 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* progress */}
              <div className="flex items-center gap-4">
                <span className="font-display text-[20px] tabular-nums text-primary-900">
                  {String(step + 1).padStart(2, "0")}
                  <span className="text-primary-900/35"> / 03</span>
                </span>
                <span className="relative h-px flex-1 bg-primary-900/15">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-primary"
                    animate={{ width: `${((step + 1) / 3) * 100}%` }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                </span>
              </div>

              <form
                className="relative mt-10 flex flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
                noValidate
              >
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.fieldset
                    key={step}
                    custom={dir}
                    className="flex flex-col"
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 60 }),
                      center: { opacity: 1, x: 0 },
                      exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -60 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <legend className="font-display text-d4 font-light leading-[1.05] text-primary-900">
                      {QUESTIONS[step]}
                    </legend>

                    {step === 0 && (
                      <div role="radiogroup" aria-label={QUESTIONS[0]} className="mt-10 grid gap-3 sm:grid-cols-2">
                        {block.services.map((o, i) => (
                          <Choice
                            key={o.value}
                            index={i}
                            selected={a.service === o.value}
                            onSelect={() => {
                              set("service", o.value);
                              // one tap is the whole question — move on by itself
                              window.setTimeout(() => go(1), reduced ? 0 : 320);
                            }}
                            label={o.label}
                            hint={o.hint}
                            highlight={i === 0}
                          />
                        ))}
                      </div>
                    )}

                    {step === 1 && (
                      <div className="mt-10 flex flex-col gap-10">
                        <div>
                          <FieldLabel htmlFor="bk-date">Date</FieldLabel>
                          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-4">
                            <input
                              id="bk-date"
                              type="date"
                              min={today}
                              value={a.date}
                              disabled={a.flexible}
                              onChange={(e) => set("date", e.target.value)}
                              className="h-14 min-w-[220px] border-b border-primary-900/25 bg-transparent font-display text-[24px] text-primary-900 outline-none transition-colors focus:border-primary disabled:opacity-35"
                            />
                            <label className="flex cursor-pointer items-center gap-3 text-body-sm text-ink/75">
                              <input
                                type="checkbox"
                                checked={a.flexible}
                                onChange={(e) => set("flexible", e.target.checked)}
                                className="h-4 w-4 accent-[var(--color-primary)]"
                              />
                              Not fixed yet
                            </label>
                          </div>
                        </div>

                        <div>
                          <FieldLabel>Where will you get ready?</FieldLabel>
                          <div role="radiogroup" className="mt-3 grid gap-3 sm:grid-cols-3">
                            {block.locations.map((o, i) => (
                              <Choice
                                key={o.value}
                                index={i}
                                compact
                                selected={a.location === o.value}
                                onSelect={() => set("location", o.value)}
                                label={o.label}
                                hint={o.hint}
                              />
                            ))}
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {needsCity && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.45, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <FieldLabel htmlFor="bk-city">City or venue</FieldLabel>
                              <TextInput
                                id="bk-city"
                                value={a.city}
                                onChange={(v) => set("city", v)}
                                placeholder="e.g. Udaipur, or Dubai"
                                autoComplete="address-level2"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="mt-10 flex flex-col gap-8">
                        <div>
                          <FieldLabel htmlFor="bk-name">Your name</FieldLabel>
                          <TextInput
                            id="bk-name"
                            value={a.name}
                            onChange={(v) => set("name", v)}
                            placeholder="Full name"
                            autoComplete="name"
                            autoFocus
                          />
                        </div>
                        <div>
                          <FieldLabel htmlFor="bk-phone">WhatsApp number</FieldLabel>
                          <TextInput
                            id="bk-phone"
                            value={a.phone}
                            onChange={(v) => set("phone", v)}
                            placeholder="+91 98xxx xxxxx"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                          />
                          <p className="mt-3 text-body-xs text-muted">
                            Include the country code if you are outside India.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.fieldset>
                </AnimatePresence>

                <AnimatePresence>
                  {touched && !valid[step] && (
                    <motion.p
                      role="alert"
                      className="mt-6 text-body-sm text-primary"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {step === 0
                        ? "Choose what you would like to book."
                        : step === 1
                          ? "Pick a date (or ‘not fixed yet’) and where you will get ready."
                          : "Add your name and a WhatsApp number we can reach."}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-auto flex items-center justify-between gap-4 pt-12">
                  {step > 0 ? (
                    <button type="button" onClick={() => go(step - 1)}>
                      <GlassPanel tone="dark" className="h-14 px-6">
                        <span className="flex items-center gap-2 text-body-sm uppercase tracking-[0.16em]">
                          <ArrowLeft size={16} strokeWidth={1.5} /> Back
                        </span>
                      </GlassPanel>
                    </button>
                  ) : (
                    <span />
                  )}
                  {step > 0 && (
                    <button type="submit">
                      {/* tinted glass once the step is complete, clear glass until then */}
                      <GlassPanel
                        tone={valid[step] ? "accent" : "dark"}
                        className={cn("h-14 px-8 transition-opacity duration-500", !valid[step] && "opacity-60")}
                      >
                        <span className="flex items-center gap-3 text-body-sm uppercase tracking-[0.16em]">
                          {step === 2 ? "Review request" : "Continue"}
                          <ArrowRight
                            size={16}
                            strokeWidth={1.5}
                            className="transition-transform duration-500 group-hover:translate-x-1"
                          />
                        </span>
                      </GlassPanel>
                    </button>
                  )}
                </div>
              </form>

              <p className="mt-8 flex items-center gap-2 text-body-xs text-muted">
                <Phone size={13} strokeWidth={1.5} /> Prefer to talk? Tap the chat button — we reply on WhatsApp.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Choice({
  label,
  hint,
  selected,
  onSelect,
  index,
  compact,
  highlight,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
  index: number;
  compact?: boolean;
  highlight?: boolean;
}) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={hint ? `${label} — ${hint}` : label}
      onClick={onSelect}
      className="group block text-left"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.6, ease: EASE }}
      whileTap={{ scale: 0.98 }}
    >
      {/* a Control Center tile: rounded glass, brand-tinted when chosen */}
      <GlassPanel
        tone={selected ? "accent" : "dark"}
        radius={26}
        className={cn(
          "items-start justify-start transition-transform duration-500",
          compact ? "min-h-[76px] px-5 py-4" : "min-h-[104px] px-6 py-5",
        )}
      >
        <span className="flex w-full items-start justify-between gap-3">
          <span className="flex flex-col gap-1.5">
            {highlight && (
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.22em]",
                  selected ? "text-primary-100" : "text-primary",
                )}
              >
                Signature course
              </span>
            )}
            <span
              className={cn(
                "font-display leading-[1.1]",
                selected ? "text-white" : "text-primary-900",
                compact ? "text-[20px]" : "text-[24px]",
              )}
            >
              {label}
            </span>
            {hint && (
              <span className={cn("text-body-xs leading-[1.5]", selected ? "text-white/75" : "text-ink/60")}>
                {hint}
              </span>
            )}
          </span>
          {/* the white disc of an active Control Center toggle */}
          <span
            aria-hidden
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300",
              selected
                ? "bg-white text-primary shadow-[0_2px_8px_rgba(40,1,20,0.35)]"
                : "border border-primary-900/20 bg-white/50",
            )}
          >
            {selected && <Check size={13} strokeWidth={2.2} />}
          </span>
        </span>
      </GlassPanel>
    </motion.button>
  );
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag htmlFor={htmlFor} className="block text-overline uppercase tracking-[0.22em] text-muted">
      {children}
    </Tag>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  autoFocus,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "tel" | "text";
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <span className="relative mt-3 block">
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="peer h-14 w-full border-b border-primary-900/25 bg-transparent font-display text-[26px] text-primary-900 outline-none placeholder:text-primary-900/25"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100"
      />
    </span>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-canvas px-5 py-4">
      <dt className="text-overline uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="mt-2 font-display text-[20px] leading-[1.2] text-primary-900">{value}</dd>
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
