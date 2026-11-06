"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { SpinGuest } from "@/components/spin/SpinGuest";
import { SpinHud } from "@/components/spin/SpinHud";
import { SpinSceneBack, SpinSceneFront } from "@/components/spin/SpinScene";
import { useSpinClock } from "@/components/spin/useSpinClock";

/** 2D mock of the camera app mid-take: the arm orbits a guest while the clip records. */
export function SpinPhone({ label, speed }: { label: string; speed: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  const progress = useSpinClock(inView && !reducedMotion);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="w-40 rotate-3 rounded-[1.75rem] border-2 border-paper bg-ink p-1.5 shadow-[6px_6px_0_0_var(--color-primary-strong)] sm:w-52"
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1.35rem] bg-ink-soft">
        <SpinSceneBack progress={progress} />
        <SpinGuest progress={progress} className="absolute bottom-[3.6rem] left-[12%] h-[66%] w-[76%]" />
        <SpinSceneFront progress={progress} />
        <SpinHud progress={progress} label={label} speed={speed} />
      </div>
    </div>
  );
}
