import { motionValue } from "motion/react";

/** Length of the seamless loop in seconds. The arm slows to a crawl at its midpoint. */
export const LOOP = 8;
/** Mid-loop slow motion: the poster and the video's first frame, which hides its loop seam there. */
export const STILL_TIME = LOOP / 2;

/** `public/spin` frames hold the card at the left and the phone's feed at the top right. */
export const FRAME_WIDTH = 1640;
export const FEED_X = 1100;
export const FEED_WIDTH = 540;
export const FEED_HEIGHT = 960;

const TAU = Math.PI * 2;
const ARM_RAMP = 0.8;
const ARM_REVOLUTIONS = 3;
/** The arm's angle at the still frame, and the way the guest faces, as rendered. */
const STILL_ANGLE = -1.75;
const GUEST_FACING = 0.62 - Math.PI / 2;

/** Orbit position in degrees at `time`: 0 faces the guest, 180 is behind her. */
function orbitAt(time: number) {
  const sped = time + ((ARM_RAMP * LOOP) / TAU) * Math.sin((TAU * time) / LOOP);
  const turned = (ARM_REVOLUTIONS * TAU * (sped - STILL_TIME)) / LOOP;
  const angle = STILL_ANGLE + turned - GUEST_FACING;
  return Math.floor(((angle % TAU) + TAU) % TAU * (36000 / TAU)) / 100;
}

/** 0 at full speed, 1 at the bottom of the slow-motion dip. */
const slowAt = (time: number) => Math.round(((1 - Math.cos((TAU * time) / LOOP)) / 2) * 1000) / 1000;

/** The take on screen, written for each video frame and read by the phone's HUD. */
export const spinFeed = {
  /** Seconds into the loop. */
  clip: motionValue(STILL_TIME),
  orbit: motionValue(orbitAt(STILL_TIME)),
  slow: motionValue(slowAt(STILL_TIME)),
};

export function showSpinTime(time: number) {
  spinFeed.clip.set(time);
  spinFeed.orbit.set(orbitAt(time));
  spinFeed.slow.set(slowAt(time));
}
