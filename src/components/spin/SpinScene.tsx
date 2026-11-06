"use client";

import type { ReactNode } from "react";
import { type MotionValue, motion, useTransform } from "motion/react";

/** Screen is 180 wide: each tile is a seamless lap, so a wider tile moves faster. */
const SCREEN = { width: 180, height: 320 };

const INK = "var(--color-ink)";
const INK_SOFT = "var(--color-ink-soft)";
const PRIMARY = "var(--color-primary)";
const STRONG = "var(--color-primary-strong)";
const SOFT = "var(--color-primary-soft)";
const PAPER = "var(--color-paper)";

const swag = (x: number, width: number, y: number, drop: number) =>
  `M${x} ${y}Q${x + width / 2} ${y + drop * 2} ${x + width} ${y}`;

function Layer({
  progress,
  tile,
  reverse,
  children,
}: {
  progress: MotionValue<number>;
  tile: number;
  reverse?: boolean;
  children: ReactNode;
}) {
  // Two tiles side by side: sliding half the strip lands exactly on the start.
  const x = useTransform(progress, (p) => `${(reverse ? -p : p - 1) * 50}%`);
  return (
    <motion.svg
      style={{ x, width: `${(tile * 2 * 100) / SCREEN.width}%` }}
      className="absolute inset-y-0 left-0 h-full max-w-none"
      viewBox={`0 0 ${tile * 2} ${SCREEN.height}`}
      preserveAspectRatio="none"
    >
      <g>{children}</g>
      <g transform={`translate(${tile} 0)`}>{children}</g>
    </motion.svg>
  );
}

const BULBS = Array.from({ length: 12 }, (_, i) => {
  const x = 15 + i * 45;
  const t = (x % 180) / 180;
  return { x, y: 44 + 44 * t * (1 - t) * 2, big: i % 3 === 0 };
});

function BackWall() {
  return (
    <>
      {/* Wall panels */}
      {[0, 180, 360].map((x) => (
        <rect key={x} x={x + 18} y="72" width="144" height="150" rx="10" fill={INK} opacity="0.55" />
      ))}
      {/* String lights */}
      {[0, 180, 360].map((x) => (
        <path key={x} d={swag(x, 180, 40, 22)} fill="none" stroke={PAPER} strokeWidth="2" />
      ))}
      {BULBS.map(({ x, y, big }) => (
        <circle key={x} cx={x} cy={y} r={big ? 6 : 4.5} fill={big ? PAPER : PRIMARY} stroke={INK} strokeWidth="2" />
      ))}
      {/* Disco ball */}
      <path d="M90 0V62" stroke={PAPER} strokeWidth="2" />
      <circle cx="90" cy="84" r="24" fill={PAPER} stroke={INK} strokeWidth="3" />
      <path
        d="M66 84h48M70 71h40M70 97h40M90 60v48M78 63q-8 21 0 42M102 63q8 21 0 42"
        fill="none"
        stroke={INK}
        strokeWidth="2"
      />
      {/* Balloons */}
      {[
        [290, 128, PRIMARY],
        [322, 104, PAPER],
        [346, 140, STRONG],
      ].map(([cx, cy, fill]) => (
        <g key={String(cx)}>
          <path d={`M${cx} ${Number(cy) + 26}q-6 26 2 56`} fill="none" stroke={PAPER} strokeWidth="1.5" />
          <ellipse cx={cx} cy={cy} rx="21" ry="26" fill={String(fill)} stroke={INK} strokeWidth="3" />
        </g>
      ))}
      {/* Bunting */}
      <path d={swag(400, 130, 110, 12)} fill="none" stroke={PAPER} strokeWidth="2" />
      {[412, 432, 452, 472, 492, 512].map((x, i) => (
        <path
          key={x}
          d={`M${x - 8} ${118 + (i === 0 || i === 5 ? -4 : 3)}h16l-8 18z`}
          fill={i % 2 ? PAPER : PRIMARY}
          stroke={INK}
          strokeWidth="2"
        />
      ))}
      {/* Dance floor */}
      <rect y="222" width="540" height="98" fill={INK} />
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={i} x={i * 30} y="222" width="30" height="16" fill={i % 2 ? STRONG : INK_SOFT} />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={i * 45} y="238" width="45" height="30" fill={i % 2 ? INK_SOFT : PRIMARY} />
      ))}
    </>
  );
}

function Bokeh() {
  return (
    <>
      {[
        [30, 150, 15, PRIMARY],
        [86, 196, 9, PAPER],
        [150, 128, 20, STRONG],
        [216, 176, 11, SOFT],
        [262, 118, 16, PRIMARY],
        [318, 200, 8, PAPER],
      ].map(([cx, cy, r, fill]) => (
        <circle key={String(cx)} cx={cx} cy={cy} r={r} fill={String(fill)} opacity="0.3" />
      ))}
    </>
  );
}

function Foreground() {
  return (
    <>
      <path d="M22 0q24 34 -6 62" fill="none" stroke={PRIMARY} strokeWidth="7" strokeLinecap="round" />
      <path d="M196 0q-22 30 8 58" fill="none" stroke={PAPER} strokeWidth="6" strokeLinecap="round" />
      {[
        [92, 96, 20, PRIMARY],
        [140, 214, -30, PAPER],
        [264, 150, 45, STRONG],
        [300, 58, -15, PRIMARY],
        [58, 232, 60, PAPER],
        [236, 240, 15, PRIMARY],
      ].map(([x, y, rotate, fill]) => (
        <rect
          key={String(x)}
          x="-5"
          y="-3.5"
          width="10"
          height="7"
          fill={String(fill)}
          stroke={INK}
          strokeWidth="1.6"
          transform={`translate(${x} ${y}) rotate(${rotate})`}
        />
      ))}
    </>
  );
}

/** Room behind the guest. Beyond the pivot things slide with the camera, the far wall fastest. */
export function SpinSceneBack({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      <Layer progress={progress} tile={540}>
        <BackWall />
      </Layer>
      <Layer progress={progress} tile={360}>
        <Bokeh />
      </Layer>
    </>
  );
}

/** Confetti between lens and guest crosses the other way, which is what sells the orbit. */
export function SpinSceneFront({ progress }: { progress: MotionValue<number> }) {
  return (
    <Layer progress={progress} tile={360} reverse>
      <Foreground />
    </Layer>
  );
}
