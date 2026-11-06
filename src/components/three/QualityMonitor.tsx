"use client";

import { PerformanceMonitor } from "@react-three/drei";
import type { Quality } from "./quality";

const SETTLE_AFTER_FLIPS = 4;

/** Steps quality down when the frame rate sags, and back up to `ceiling` when it recovers. */
export function QualityMonitor({
  ceiling,
  onChange,
}: {
  ceiling: Quality;
  onChange: (update: (quality: Quality) => Quality) => void;
}) {
  return (
    <PerformanceMonitor
      flipflops={SETTLE_AFTER_FLIPS}
      onDecline={() => onChange((quality) => Math.max(quality - 1, 0) as Quality)}
      onIncline={() => onChange((quality) => Math.min(quality + 1, ceiling) as Quality)}
    />
  );
}
