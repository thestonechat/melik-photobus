"use client";

import { useCallback, useRef, useState } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

const STREAM = [
  { left: "5%", delay: 0, size: 14, rot: 0 },
  { left: "20%", delay: 0.5, size: 11, rot: 90 },
  { left: "38%", delay: 1.0, size: 16, rot: 45 },
  { left: "56%", delay: 0.3, size: 12, rot: 120 },
  { left: "74%", delay: 0.8, size: 15, rot: 30 },
  { left: "90%", delay: 0.15, size: 10, rot: 200 },
  { left: "83%", delay: 1.3, size: 12, rot: 60 },
  { left: "11%", delay: 1.6, size: 12, rot: 140 },
];

const BURST = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const dist = 58 + (i % 4) * 26;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    rot: i % 2 === 0 ? [0, 180] : [0, -200],
    size: 12 + (i % 3) * 4,
    light: i % 3 === 0,
  };
});

interface SparkleButtonProps extends HTMLMotionProps<"button"> {
  className?: string;
}

export function SparkleButton({
  className,
  children,
  onClick,
  ...props
}: SparkleButtonProps) {
  const [bursts, setBursts] = useState<number[]>([]);
  const idRef = useRef(0);

  const addBurst = useCallback(() => {
    const id = ++idRef.current;
    setBursts((b) => [...b, id]);
    setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1100);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      addBurst();
    },
    [onClick, addBurst],
  );

  return (
    <motion.button
      {...props}
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative isolate inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-full border-2 border-ink bg-primary font-bold text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-colors duration-200 hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 overflow-visible">
        {STREAM.map((s, i) => (
          <motion.span
            key={i}
            className="absolute -top-1 block"
            style={{ left: s.left }}
            animate={{
              y: [2, -26],
              opacity: [0, 1, 0],
              scale: [0.3, 1],
              rotate: [s.rot, s.rot + 160],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut",
            }}
          >
            <Sparkle
              size={s.size}
              className={s.left === "90%" ? "text-white" : "text-ink"}
            />
          </motion.span>
        ))}
      </span>

      {bursts.map((id) => (
        <span
          key={id}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {BURST.map((b, i) => (
            <motion.span
              key={i}
              className="absolute"
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1.1, 0.9],
                x: b.x,
                y: b.y,
                rotate: b.rot,
              }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <Sparkle
                size={b.size}
                className={b.light ? "text-white" : "text-ink"}
              />
            </motion.span>
          ))}
        </span>
      ))}

      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children as React.ReactNode}
      </span>
    </motion.button>
  );
}