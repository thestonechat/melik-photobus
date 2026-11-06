/** Real van profile from busGeometry.ts, facing right, in the 64 box. */
export const VAN = "M6 22H40Q45 22 48 25L58 34Q60 35 60 38V47Q60 49 58 49H6Q4 49 4 47V24Q4 22 6 22Z";
export const WINDSCREEN = "M43 26L52 34H43Z";

/** Front elevation: tapering cab, windscreen, two-tone waist. */
export const FRONT = "M16 12H48Q52 12 53 16L58 38V50Q58 54 54 54H10Q6 54 6 50V38L11 16Q12 12 16 12Z";
export const FRONT_LOWER = "M7.4 32H56.6L58 38V50Q58 54 54 54H10Q6 54 6 50V38Z";
export const FRONT_GLASS = "M19 17H45Q47 17 47.5 19L49.5 28H14.5L16.5 19Q17 17 19 17Z";

export function Wheels({ cy = 49, r = 7, left = 15, right = 47 }: { cy?: number; r?: number; left?: number; right?: number }) {
  return (
    <>
      {[left, right].map((cx) => (
        <circle key={cx} cx={cx} cy={cy} r={r} fill="var(--m-fg)" stroke="var(--m-bg)" strokeWidth={2.5} />
      ))}
    </>
  );
}
