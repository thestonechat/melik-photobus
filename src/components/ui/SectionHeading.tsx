"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  /** Fade in on scroll. Disable for headings that can sit at the fold. */
  reveal?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  reveal = true,
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={reveal ? { opacity: 0, y: 24 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <span className="inline-block -rotate-2 rounded-full border-2 border-ink bg-primary px-4 py-1 text-sm font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
        {eyebrow}
      </span>
      <h2
        className={cn(
          "mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl",
          tone === "dark" ? "text-paper" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed",
            tone === "dark" ? "text-paper/70" : "text-ink-muted",
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}