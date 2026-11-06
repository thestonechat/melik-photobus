"use client";

import { motion, useReducedMotion } from "motion/react";

/** Rotating circular stamp with a fixed "360°" centre. */
export function SpinBadge({ text }: { text: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="relative h-24 w-24 sm:h-28 sm:w-28">
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
      >
        <circle cx="50" cy="50" r="49" fill="var(--color-ink)" />
        <path id="spin-badge-path" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" fill="none" />
        <text className="fill-primary font-display text-[10.5px] font-bold uppercase tracking-[0.12em]">
          <textPath href="#spin-badge-path">{text}</textPath>
        </text>
      </motion.svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-paper sm:text-2xl">
        360°
      </span>
    </div>
  );
}
