"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
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
      <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
    </motion.div>
  );
}