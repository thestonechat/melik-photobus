"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { SpinHud } from "@/components/spin/SpinHud";
import { FEED_HEIGHT, FEED_WIDTH, spinFeed } from "@/components/spin/spinFeed";

function attachScreen(canvas: HTMLCanvasElement | null) {
  spinFeed.screen = canvas?.getContext("2d") ?? null;
}

/** Shown until the 3D scene draws its first frame, and whenever WebGL is unavailable. */
function StaticFeed() {
  return (
    <svg viewBox="0 0 90 160" className="absolute inset-0 h-full w-full">
      <rect y="104" width="90" height="56" fill="var(--color-primary)" />
      <path d="M38 96v22M52 96v22" stroke="var(--color-primary-soft)" strokeWidth="5" />
      <path d="M45 56 26 100h38z" fill="var(--color-primary)" stroke="var(--color-ink)" strokeWidth="2" />
      <circle cx="45" cy="44" r="13" fill="var(--color-primary-soft)" stroke="var(--color-ink)" strokeWidth="2" />
    </svg>
  );
}

/** The arm's camera, live: its canvas is painted by the 3D scene in `SpinModel`. */
export function SpinPhone({ label, speed }: { label: string; speed: string }) {
  const screen = useRef<HTMLCanvasElement>(null);
  const inView = useInView(screen);

  useEffect(() => {
    attachScreen(screen.current);
    return () => attachScreen(null);
  }, []);

  useEffect(() => {
    spinFeed.screenVisible = inView;
  }, [inView]);

  return (
    <div
      aria-hidden="true"
      className="w-32 rotate-3 rounded-[1.75rem] border-2 border-paper bg-ink p-1.5 shadow-[6px_6px_0_0_var(--color-primary-strong)] sm:w-52"
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1.35rem] bg-ink-soft">
        <StaticFeed />
        <canvas ref={screen} width={FEED_WIDTH} height={FEED_HEIGHT} className="absolute inset-0 h-full w-full" />
        <SpinHud label={label} speed={speed} />
      </div>
    </div>
  );
}
