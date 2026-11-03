"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
}

export function GlassCard({
  hover = true,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      {...props}
      whileHover={hover ? { y: -6, rotate: -0.5 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "rounded-3xl border-2 border-ink bg-white/60 p-8 shadow-[4px_4px_0_0_var(--color-ink)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}