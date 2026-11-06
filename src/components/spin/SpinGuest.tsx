"use client";

import { useState } from "react";
import { type MotionValue, useMotionValueEvent } from "motion/react";
import { buildGuest, CAMERA_TILT, GUEST_VIEWBOX, platformTicks } from "@/components/spin/guestRig";

const FLOOR_Y = 182;
const PLATFORM_RADIUS = 54;
/** Stepped on purpose: 120 poses per lap keeps a hand-animated feel at about 15 redraws a second. */
const POSES = 120;

const poseAt = (progress: number) => Math.floor(progress * POSES);

/** The camera orbits one way, so the guest's near side travels the other. */
export function SpinGuest({ progress, className }: { progress: MotionValue<number>; className?: string }) {
  const [pose, setPose] = useState(() => poseAt(progress.get()));
  useMotionValueEvent(progress, "change", (value) => setPose(poseAt(value)));

  const phase = pose / POSES;
  const angle = -phase * 360;
  const shapes = buildGuest(angle, phase);

  return (
    <svg viewBox={GUEST_VIEWBOX} className={className} overflow="visible">
      <ellipse
        cx="60"
        cy={FLOOR_Y + 6}
        rx={PLATFORM_RADIUS}
        ry={PLATFORM_RADIUS * CAMERA_TILT}
        fill="var(--color-ink)"
      />
      <ellipse
        cx="60"
        cy={FLOOR_Y}
        rx={PLATFORM_RADIUS}
        ry={PLATFORM_RADIUS * CAMERA_TILT}
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="2.6"
      />
      {platformTicks(angle, PLATFORM_RADIUS - 6, FLOOR_Y).map(({ x, y, near }, i) => (
        <circle key={i} cx={x} cy={y} r={near ? 2.2 : 1.6} fill="var(--color-ink)" />
      ))}
      {/* Paper underlay: a sticker edge that lifts the guest off the dark room. */}
      <g fill="var(--color-paper)" stroke="var(--color-paper)" strokeLinecap="round" strokeLinejoin="round">
        {shapes
          .filter((shape) => !shape.detail)
          .map((shape, i) => (
            <path
              key={i}
              d={shape.d}
              fill={shape.fill ? undefined : "none"}
              strokeWidth={(shape.width ?? 0) + 6}
            />
          ))}
      </g>
      <g strokeLinecap="round" strokeLinejoin="round">
        {shapes.map((shape, i) => (
          <path
            key={i}
            d={shape.d}
            fill={shape.fill ?? "none"}
            stroke={shape.stroke}
            strokeWidth={shape.width}
          />
        ))}
      </g>
    </svg>
  );
}
