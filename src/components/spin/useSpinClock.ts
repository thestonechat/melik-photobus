"use client";

import { useEffect } from "react";
import { cancelFrame, frame, useMotionValue } from "motion/react";

export const LOOP_SECONDS = 8;

/** Opens on a three-quarter view: the hero frame for SSR and reduced motion. */
const START_PROGRESS = 0.06;

/** Shared 0..1 clip position. Everything on the phone derives from it, so pausing is one switch. */
export function useSpinClock(running: boolean) {
  const progress = useMotionValue(START_PROGRESS);

  useEffect(() => {
    if (!running) return;
    const tick = ({ delta }: { delta: number }) =>
      progress.set((progress.get() + delta / (LOOP_SECONDS * 1000)) % 1);
    frame.update(tick, true);
    return () => cancelFrame(tick);
  }, [running, progress]);

  return progress;
}
