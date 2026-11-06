"use client";

import { motion, useTransform } from "motion/react";
import { spinFeed } from "@/components/spin/spinFeed";

const REC_RED = "#ff1a1a";
const FPS = 30;
/** A frame's media time is rounded to the millisecond, which can land just short of the frame. */
const FRAME_SNAP = 0.1;

const pad = (value: number) => String(value).padStart(2, "0");

function formatTimecode(clip: number) {
  const frames = Math.floor(clip * FPS + FRAME_SNAP);
  return `00:${pad(Math.floor(frames / FPS))}:${pad(frames % FPS)}`;
}

const CORNERS = [
  "left-2 top-9 border-l-2 border-t-2 rounded-tl-md",
  "right-2 top-9 border-r-2 border-t-2 rounded-tr-md",
  "left-2 bottom-[4.75rem] border-l-2 border-b-2 rounded-bl-md",
  "right-2 bottom-[4.75rem] border-r-2 border-b-2 rounded-br-md",
];

/** Top-down map: the guest faces up and the dot is the camera, turning as the arm does. */
function OrbitDial() {
  const rotate = useTransform(spinFeed.orbit, (orbit) => -orbit);
  return (
    <span className="relative block h-8 w-8 rounded-full border-2 border-paper/70">
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      <motion.span style={{ rotate }} className="absolute inset-[-2px]">
        <span className="absolute left-1/2 top-[-3px] h-2 w-2 -translate-x-1/2 rounded-full border border-ink bg-paper" />
      </motion.span>
    </span>
  );
}

function StopButton() {
  const lap = useTransform(spinFeed.orbit, [0, 360], [0, 1]);
  return (
    <span className="relative flex h-12 w-12 items-center justify-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r="21.5" fill="none" stroke="var(--color-paper)" strokeOpacity="0.3" strokeWidth="4" />
        <motion.circle
          cx="24"
          cy="24"
          r="21.5"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="4"
          style={{ pathLength: lap }}
        />
      </svg>
      <span className="h-5 w-5 rounded-[5px] border-2 border-ink" style={{ background: REC_RED }} />
    </span>
  );
}

/** Camera chrome over the viewfinder. Text is short and non-wrapping to fit Georgian too. */
export function SpinHud({
  label,
  speed,
}: {
  label: string;
  speed: string;
}) {
  const timecode = useTransform(spinFeed.clip, formatTimecode);
  const degrees = useTransform(spinFeed.orbit, (orbit) => `${Math.floor(orbit)}°`);
  const blink = useTransform(spinFeed.clip, (clip) => (clip % 1 < 0.6 ? 1 : 0.2));
  const speedOpacity = useTransform(spinFeed.slow, [0.5, 0.8], [0.25, 1]);

  return (
    <>
      {CORNERS.map((corner) => (
        <span key={corner} className={`absolute h-4 w-4 border-paper ${corner}`} />
      ))}

      <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-1">
        <span
          className="flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-paper"
          style={{ background: REC_RED }}
        >
          <motion.span style={{ opacity: blink }} className="h-1.5 w-1.5 rounded-full bg-paper" />
          {label}
        </span>
        <motion.span className="rounded-md bg-ink px-1.5 py-0.5 font-display text-[10px] font-bold leading-none tabular-nums text-paper">
          {timecode}
        </motion.span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-[4.25rem] items-center justify-between border-t-2 border-ink bg-ink/85 px-2.5">
        <span className="flex w-9 flex-col items-start gap-0.5">
          <motion.span
            style={{ opacity: speedOpacity }}
            className="rounded bg-primary px-1 py-0.5 font-display text-[10px] font-bold leading-none text-ink"
          >
            {speed}
          </motion.span>
          <motion.span className="font-display text-[11px] font-bold leading-none tabular-nums text-paper">
            {degrees}
          </motion.span>
        </span>
        <StopButton />
        <span className="flex w-9 justify-end">
          <OrbitDial />
        </span>
      </div>
    </>
  );
}
