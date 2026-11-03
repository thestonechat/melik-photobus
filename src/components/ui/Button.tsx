"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "black" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps =
  | (ButtonOwnProps & HTMLMotionProps<"button"> & { href?: undefined })
  | (ButtonOwnProps & HTMLMotionProps<"a"> & { href: string });

const baseStyles =
  "inline-flex select-none items-center justify-center gap-2 rounded-full border-2 border-ink font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-primary-strong",
  outline: "bg-transparent text-ink hover:bg-ink hover:text-paper shadow-none",
  black: "bg-ink text-paper shadow-none hover:bg-primary hover:text-ink",
  ghost: "border-transparent text-ink underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-13 px-8 text-lg md:h-14",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const styles = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if ("href" in props && typeof props.href === "string") {
    const { href, ...anchorProps } = props;
    return (
      <motion.a
        {...anchorProps}
        href={href}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        className={styles}
      />
    );
  }

  return (
    <motion.button
      {...props}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={styles}
    />
  );
}