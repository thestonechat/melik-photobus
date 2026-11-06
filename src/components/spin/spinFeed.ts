import { motionValue } from "motion/react";

export const FEED_WIDTH = 270;
export const FEED_HEIGHT = 480;

/** The live take, written by the 3D scene each frame and read by the phone's HUD. */
export const spinFeed = {
  /** Seconds into the loop. */
  clip: motionValue(0),
  /** Orbit position: 0 faces the guest, 180 is behind her. */
  orbit: motionValue(0),
  /** 1 during the slow-motion dip. */
  slow: motionValue(0),
  screen: null as CanvasRenderingContext2D | null,
};
