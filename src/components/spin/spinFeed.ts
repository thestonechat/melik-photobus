import { motionValue } from "motion/react";
import type { Quality } from "@/components/three/quality";

export const FEED_WIDTH = 270;
export const FEED_HEIGHT = 480;

/** The live take, written by the 3D scene with each feed frame and read by the phone's HUD. */
export const spinFeed = {
  /** Seconds into the loop. */
  clip: motionValue(0),
  /** Orbit position: 0 faces the guest, 180 is behind her. */
  orbit: motionValue(0),
  /** 1 during the slow-motion dip. */
  slow: motionValue(0),
  screen: null as CanvasRenderingContext2D | null,
  /** Whether the phone is on screen: when it is not, the 3D scene skips its second render. */
  screenVisible: false,
  /** Set by `SpinModel`, read by the scene every frame without a React render. */
  quality: 2 as Quality,
};
