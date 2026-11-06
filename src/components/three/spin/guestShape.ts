/** Guest proportions and the leg limits that keep every leg pose inside the skirt. */
export const LEG = 0.29;
export const HIP_X = 0.07;
export const HIP_Y = -0.03;
export const LEG_RADIUS = 0.06;
/** Height of the closed underside of the skirt, the only place legs may leave it. */
export const SKIRT_FLOOR_Y = -0.225;

/** Skirt silhouette from waist to hem, as radius then height. */
export const SKIRT_PROFILE: readonly (readonly [number, number])[] = [
  [0, 0.03],
  [0.12, 0.025],
  [0.135, 0],
  [0.175, -0.07],
  [0.255, -0.15],
  [0.33, -0.205],
  [0.335, SKIRT_FLOOR_Y],
  [0, SKIRT_FLOOR_Y],
];

/** Largest hip swing, in any direction, that keeps the thigh under the skirt shell. */
const MAX_THIGH = 0.46;
/** Largest shin angle from vertical, so a heel never rises through the hem. */
const MAX_SHIN = 1.15;

export type LegAngles = { thigh: number; out: number; knee: number; footY: number };

/** Writes clamped leg angles to `leg`, plus the foot's height below the hip. */
export function solveLeg(thigh: number, out: number, knee: number, leg: LegAngles) {
  const swing = Math.hypot(thigh, out);
  const fit = swing > MAX_THIGH ? MAX_THIGH / swing : 1;
  leg.thigh = thigh * fit;
  leg.out = out * fit;
  leg.knee = Math.min(Math.max(knee, 0), MAX_SHIN + leg.thigh);
  leg.footY = LEG * Math.cos(leg.out) * (Math.cos(leg.thigh) + Math.cos(leg.knee - leg.thigh));
}

/** Inner radius of the skirt shell at height `y`. */
export function skirtRadius(y: number) {
  for (let i = 1; i < SKIRT_PROFILE.length - 1; i++) {
    const [r0, y0] = SKIRT_PROFILE[i - 1];
    const [r1, y1] = SKIRT_PROFILE[i];
    if (y <= y0 && y >= y1) return r0 + ((r1 - r0) * (y0 - y)) / (y0 - y1);
  }
  return 0;
}
