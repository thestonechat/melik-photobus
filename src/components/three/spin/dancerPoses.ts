import { BEAT, BEATS_PER_POSE } from "./timeline";

/** All angles in radians. `reach` raises the arm sideways, `swing` carries it forward. */
export type DancerPose = {
  reachL: number;
  swingL: number;
  elbowL: number;
  reachR: number;
  swingR: number;
  elbowR: number;
  crouch: number;
  liftL: number;
  liftR: number;
  splay: number;
  lean: number;
  twist: number;
  jump: number;
};

const BASE: DancerPose = {
  reachL: 0.5,
  swingL: 0,
  elbowL: 0.6,
  reachR: 0.5,
  swingR: 0,
  elbowR: 0.6,
  crouch: 0.25,
  liftL: 0,
  liftR: 0,
  splay: 0.14,
  lean: 0,
  twist: 0,
  jump: 0,
};

/** Eight key poses, one held per two beats; index 4 lands on the slow-motion peak. */
export const POSES: readonly DancerPose[] = [
  { ...BASE, reachL: 2.7, elbowL: 0.1, reachR: 0.7, elbowR: 1.5, lean: -0.16, twist: 0.3 },
  { ...BASE, reachL: 0.7, elbowL: 1.8, reachR: 2.7, elbowR: 0.1, crouch: 0.5, lean: 0.16, twist: -0.3 },
  { ...BASE, reachL: 1.4, elbowL: 1.5, reachR: 1.4, elbowR: 1.5, crouch: 0.6, splay: 0.3 },
  { ...BASE, reachL: 2.2, swingL: 0.5, reachR: 0.3, swingR: -0.7, elbowR: 1.2, liftR: 0.9, lean: -0.2 },
  { ...BASE, reachL: 2.85, elbowL: 0.2, reachR: 2.85, elbowR: 0.2, crouch: 0.1, liftL: 0.7, splay: 0.32, jump: 0.2 },
  { ...BASE, reachL: 0.4, swingL: 1.2, elbowL: 1.6, reachR: 1.6, elbowR: 0.1, liftL: 0.8, lean: 0.14, twist: 0.4 },
  { ...BASE, reachL: 1.6, elbowL: 0.1, reachR: 0.4, swingR: 1.2, elbowR: 1.6, crouch: 0.45, lean: -0.14, twist: -0.4 },
  { ...BASE, reachL: 2.5, elbowL: 1.2, reachR: 2.5, elbowR: 1.2, crouch: 0.65, splay: 0.34 },
];

const POSE_KEYS = Object.keys(BASE) as (keyof DancerPose)[];
const POSE_LENGTH = BEAT * BEATS_PER_POSE;
const SNAP = 0.4;
const OVERSHOOT = 1.9;

function easeOutBack(x: number) {
  const k = x - 1;
  return 1 + (OVERSHOOT + 1) * k * k * k + OVERSHOOT * k * k;
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function wrapIndex(index: number) {
  return ((index % POSES.length) + POSES.length) % POSES.length;
}

/** Writes the pose at `stage` into `out`: a fast overshooting snap, then a hold. */
export function samplePose(stage: number, out: DancerPose) {
  const position = stage / POSE_LENGTH;
  const index = Math.floor(position);
  const from = POSES[wrapIndex(index)];
  const to = POSES[wrapIndex(index + 1)];
  const k = easeOutBack(Math.min((position - index) / SNAP, 1));
  for (const key of POSE_KEYS) out[key] = mix(from[key], to[key], k);
}

export function restPose(): DancerPose {
  return { ...BASE };
}
