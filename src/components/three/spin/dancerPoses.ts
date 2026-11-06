import { BEAT, BEATS_PER_POSE, TAU } from "./timeline";

type Arm = readonly [reach: number, swing: number, twist: number, elbow: number];
type Leg = readonly [thigh: number, out: number, knee: number];

/** Radians unless noted. `twist` above 0 turns the elbow's hinge towards the body. */
export type DancerPose = {
  armL0: number; armL1: number; armL2: number; armL3: number;
  armR0: number; armR1: number; armR2: number; armR3: number;
  legL0: number; legL1: number; legL2: number;
  legR0: number; legR1: number; legR2: number;
  /** Pelvis roll; torso `lean` opposes it for an S-curve. */
  roll: number;
  lean: number;
  turn: number;
  bow: number;
  nod: number;
  tilt: number;
  /** Height off the floor. */
  jump: number;
  /** 0 to 1 fractions. */
  flare: number;
  hair: number;
  peace: number;
  kiss: number;
  /** Whole-body yaw; 0 outside a twirl. */
  spin: number;
};

type Key = {
  armL: Arm;
  armR: Arm;
  legL?: Leg;
  legR?: Leg;
  twirl?: boolean;
} & Partial<Omit<DancerPose, `arm${string}` | `leg${string}` | "spin">>;

const STAND: Leg = [0.04, 0.1, 0.1];
const HIP_HAND: Arm = [0.8, -0.1, 1.5, 1.95];
const SPARKLER_UP: Arm = [2.55, 0.15, 0, 0.25];

/** One key per two beats, offset so the hands-up jump holds over the slow-motion peak. */
const KEYS: readonly Key[] = [
  { // peace sign by the cheek
    armL: [1.3, 0.3, -1.25, 2.15], armR: HIP_HAND, legR: [0.2, 0.05, 0.42],
    roll: -0.14, lean: 0.2, tilt: 0.24, turn: -0.2, peace: 1, flare: 0.1,
  },
  { // heel pop
    armL: [0.7, 0.75, 0.7, 1.55], armR: SPARKLER_UP, legL: [0.34, -0.03, 1.5], legR: [-0.02, 0.06, 0.04],
    roll: 0.16, lean: -0.2, tilt: -0.16, bow: 0.06, turn: 0.22, flare: 0.25,
  },
  { // blowing a kiss
    armL: [0.3, 1.18, 0.34, 2.45], armR: [1.35, -0.25, 0, 0.3], legL: [0.02, 0.06, 0.05], legR: [-0.2, 0.02, 0.85],
    roll: -0.1, lean: 0.12, tilt: 0.12, nod: 0.08, turn: 0.15, kiss: 1, flare: 0.15,
  },
  { // hand on hip, hair flip
    armL: HIP_HAND, armR: [2.5, 0.35, -0.3, 1.5], legL: [0.24, -0.1, 0.5],
    roll: 0.18, lean: -0.22, tilt: -0.28, nod: -0.22, turn: -0.26, hair: 1, flare: 0.3,
  },
  { // twirl
    armL: [1.55, 0.1, 0, 0.2], armR: [1.75, 0.1, 0, 0.2], legL: [0.02, 0.02, 0.05], legR: [0.26, 0.02, 0.78],
    lean: 0.06, tilt: 0.1, twirl: true, flare: 0.75, hair: 0.6,
  },
  { // hands-up jump, the hero
    armL: [2.68, 0.08, 0, 0.16], armR: [2.45, 0.08, 0, 0.3], legL: [0.36, -0.14, 1.5], legR: [0.2, 0.16, 1.2],
    roll: -0.08, lean: 0.1, bow: -0.08, nod: -0.1, tilt: 0.12, jump: 0.24, flare: 1, hair: 0.8,
  },
  { // landing curtsey
    armL: [0.62, 0.2, 1.1, 0.55], armR: [0.85, 0.3, 1.1, 0.5], legL: [0.36, 0.08, 0.72], legR: [-0.1, 0.03, 1.05],
    roll: 0.1, lean: -0.1, bow: 0.14, tilt: -0.18, nod: 0.15, flare: 0.45,
  },
  { // sparkler sweep on tiptoe
    armL: [1.0, 0.5, 0.8, 1.6], armR: [2.15, 0.45, 0, 0.3], legL: [0.08, 0.04, 0.18], legR: [0.18, 0.06, 0.68],
    roll: 0.12, lean: -0.16, tilt: -0.12, turn: 0.28, flare: 0.2,
  },
];

function toPose(key: Key): DancerPose {
  const [armL0, armL1, armL2, armL3] = key.armL;
  const [armR0, armR1, armR2, armR3] = key.armR;
  const [legL0, legL1, legL2] = key.legL ?? STAND;
  const [legR0, legR1, legR2] = key.legR ?? STAND;
  return {
    armL0, armL1, armL2, armL3, armR0, armR1, armR2, armR3,
    legL0, legL1: -legL1, legL2, legR0, legR1, legR2,
    roll: key.roll ?? 0,
    lean: key.lean ?? 0,
    turn: key.turn ?? 0,
    bow: key.bow ?? 0,
    nod: key.nod ?? 0,
    tilt: key.tilt ?? 0,
    jump: key.jump ?? 0,
    flare: key.flare ?? 0,
    hair: key.hair ?? 0,
    peace: key.peace ?? 0,
    kiss: key.kiss ?? 0,
    spin: 0,
  };
}

const POSES = KEYS.map(toPose);
const POSE_LENGTH = BEAT * BEATS_PER_POSE;
const POSE_KEYS = Object.keys(POSES[0]) as (keyof DancerPose)[];
const POSE_OFFSET = 0.45;
const SNAP = 0.45;
const TWIRL_SNAP = 0.95;
const OVERSHOOT = 1.4;

function easeOutBack(x: number) {
  const k = x - 1;
  return 1 + (OVERSHOOT + 1) * k * k * k + OVERSHOOT * k * k;
}

function easeInOut(x: number) {
  return x * x * (3 - 2 * x);
}

function wrapIndex(index: number) {
  return ((index % POSES.length) + POSES.length) % POSES.length;
}

/** Writes the pose at `stage` into `out`: a quick overshooting snap, then a hold. */
export function samplePose(stage: number, out: DancerPose) {
  const position = stage / POSE_LENGTH + POSE_OFFSET;
  const index = Math.floor(position);
  const from = POSES[wrapIndex(index)];
  const to = POSES[wrapIndex(index + 1)];
  const twirl = KEYS[wrapIndex(index + 1)].twirl;
  const progress = Math.min((position - index) / (twirl ? TWIRL_SNAP : SNAP), 1);
  const k = twirl ? easeInOut(progress) : easeOutBack(progress);
  for (const key of POSE_KEYS) out[key] = from[key] + (to[key] - from[key]) * k;
  out.flare = Math.max(out.flare, 0);
  out.spin = twirl ? k * TAU : 0;
}

export function restPose(): DancerPose {
  return { ...POSES[0] };
}
