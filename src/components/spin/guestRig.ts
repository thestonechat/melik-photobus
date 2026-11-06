/**
 * A small 3D rig drawn flat: every body part is a point in guest space, rotated around the
 * vertical axis and sorted by depth, so the turn is a real rotation rather than a squash.
 * Guest space: x right, y down (viewBox units), z towards the camera.
 */

export type GuestShape = {
  d: string;
  z: number;
  fill?: string;
  stroke?: string;
  width?: number;
  /** Details sit inside the silhouette and are skipped by the sticker outline. */
  detail?: boolean;
};

type Vec3 = readonly [x: number, y: number, z: number];
type Screen = { x: number; y: number; z: number };

const INK = "var(--color-ink)";
const SKIN = "var(--color-primary-soft)";
const DRESS = "var(--color-primary)";
const TRIM = "var(--color-paper)";

export const GUEST_VIEWBOX = "0 0 120 200";
const CENTER_X = 60;
/** Camera sits slightly above: nearer points drop on screen. */
export const CAMERA_TILT = 0.2;

const HEAD: Vec3 = [0, 45, 0];
const HEAD_RADIUS = 18;
const RADIANS = Math.PI / 180;

const n = (value: number) => value.toFixed(1);
const point = ({ x, y }: Screen) => `${n(x)} ${n(y)}`;

const ellipse = (x: number, y: number, rx: number, ry: number) =>
  `M${n(x - rx)} ${n(y)}a${n(rx)} ${n(ry)} 0 1 0 ${n(rx * 2)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-rx * 2)} 0z`;

function createView(angle: number) {
  const sin = Math.sin(angle * RADIANS);
  const cos = Math.cos(angle * RADIANS);
  return ([x, y, z]: Vec3): Screen => {
    const depth = z * cos - x * sin;
    return { x: CENTER_X + x * cos + z * sin, y: y + depth * CAMERA_TILT, z: depth };
  };
}

type View = ReturnType<typeof createView>;

/** Point on the head sphere; `yaw` turns from the nose, `drop` moves down from the eyeline. */
function onHead(yaw: number, drop: number, lift = 1): Vec3 {
  const cosDrop = Math.cos(drop * RADIANS);
  return [
    HEAD[0] + HEAD_RADIUS * lift * cosDrop * Math.sin(yaw * RADIANS),
    HEAD[1] + HEAD_RADIUS * lift * Math.sin(drop * RADIANS),
    HEAD[2] + HEAD_RADIUS * lift * cosDrop * Math.cos(yaw * RADIANS),
  ];
}

/** Two-tone limb: an ink line with a thinner colour line on top. */
function limb(view: View, joints: readonly Vec3[], color: string, thickness = 10): GuestShape[] {
  const points = joints.map(view);
  const d = `M${points.map(point).join("L")}`;
  const z = points.reduce((sum, p) => sum + p.z, 0) / points.length;
  return [
    { d, z, stroke: INK, width: thickness },
    { d, z, stroke: color, width: thickness - 4.5, detail: true },
  ];
}

/** Silhouette of the elliptical skirt-and-bodice column at this view. */
function dress(view: View, angle: number, sway: number): GuestShape[] {
  const sin = Math.sin(angle * RADIANS);
  const cos = Math.cos(angle * RADIANS);
  const halfWidth = (a: number, b: number) => Math.hypot(a * cos, b * sin);
  const shoulder = halfWidth(13, 8);
  const waist = halfWidth(10, 8);
  const hem = halfWidth(30 + sway, 25 + sway);
  const hemDepth = 25 * CAMERA_TILT;
  const hemY = 142;
  const left = CENTER_X - hem + sway;
  const right = CENTER_X + hem + sway;
  const body =
    `M${n(CENTER_X - shoulder)} 72L${n(CENTER_X + shoulder)} 72` +
    `Q${n(CENTER_X + waist)} 88 ${n(CENTER_X + waist)} 98Q${n(CENTER_X + waist + 4)} 118 ${n(right)} ${hemY}` +
    `A${n(hem)} ${n(hemDepth)} 0 0 1 ${n(left)} ${hemY}` +
    `Q${n(CENTER_X - waist - 4)} 118 ${n(CENTER_X - waist)} 98Q${n(CENTER_X - waist)} 88 ${n(CENTER_X - shoulder)} 72z`;

  const shapes: GuestShape[] = [
    { d: body, z: 0, fill: DRESS, stroke: INK, width: 2.6 },
    {
      d: `M${n(CENTER_X - waist)} 98A${n(waist)} 2.4 0 0 0 ${n(CENTER_X + waist)} 98`,
      z: 0,
      stroke: INK,
      width: 3.4,
      detail: true,
    },
  ];

  // Print dots ride the skirt surface, which is what reads as turning at a glance.
  for (let row = 0; row < 3; row++) {
    const y = 110 + row * 11;
    const spread = (y - 98) / 44;
    for (let i = 0; i < 9; i++) {
      const yaw = (i * 40 + row * 20) * RADIANS;
      const a = 10 + spread * 20;
      const b = 8 + spread * 17;
      const dot = view([a * Math.sin(yaw), y, b * Math.cos(yaw)]);
      const facing = dot.z / b;
      if (facing > 0.2) {
        shapes.push({
          d: ellipse(dot.x + sway * spread, dot.y, 2.6 * facing, 2.6),
          z: 0,
          fill: INK,
          detail: true,
        });
      }
    }
  }
  return shapes;
}

/** Ink head with a skin cap cut into it: the hairline stays on the sphere as it turns. */
function head(view: View): GuestShape[] {
  const center = view(HEAD);
  const z = 1;
  const shapes: GuestShape[] = [
    { d: ellipse(center.x, center.y, HEAD_RADIUS, HEAD_RADIUS), z, fill: INK, stroke: INK, width: 2.6 },
  ];

  const faceTilt = 16;
  const reach = 74;
  const noseSide = Math.sign(view(onHead(0, 0)).x - center.x);
  const outline = Array.from({ length: 32 }, (_, i) => {
    const t = (i / 32) * 360 * RADIANS;
    const yaw = reach * Math.cos(t);
    const drop = faceTilt + reach * Math.sin(t);
    const raw = view(onHead(yaw, Math.min(drop, 86)));
    if (raw.z >= 0) return raw;
    // Hidden edge runs along the limb on the nose's side, leaving a crescent as the face turns away.
    const dy = Math.max(-HEAD_RADIUS, Math.min(HEAD_RADIUS, raw.y - center.y));
    return { ...raw, x: center.x + noseSide * Math.sqrt(HEAD_RADIUS ** 2 - dy ** 2), y: center.y + dy };
  });
  if (outline.some((p) => p.z > 2)) {
    shapes.push({ d: `M${outline.map(point).join("L")}z`, z, fill: SKIN, detail: true });
  }

  const feature = (yaw: number, drop: number) => view(onHead(yaw, drop));
  for (const side of [-1, 1]) {
    const eye = feature(side * 26, 8);
    const foreshorten = eye.z / HEAD_RADIUS;
    if (foreshorten > 0.12) {
      shapes.push({ d: ellipse(eye.x, eye.y, 2.5 * foreshorten, 3.1), z, fill: INK, detail: true });
    }
    const cheek = feature(side * 46, 24);
    if (cheek.z > 5) {
      shapes.push({
        d: ellipse(cheek.x, cheek.y, 3.4 * (cheek.z / HEAD_RADIUS), 2.2),
        z,
        fill: DRESS,
        detail: true,
      });
    }
  }

  const smile = [feature(-24, 30), feature(0, 44), feature(24, 30)];
  if (smile[1].z > 4) {
    shapes.push({
      d: `M${point(smile[0])}Q${point(smile[1])} ${point(smile[2])}`,
      z,
      stroke: INK,
      width: 2.2,
      detail: true,
    });
  }
  return shapes;
}

function hair(view: View, sway: number): GuestShape[] {
  const root = view([0, 30, -16]);
  const bend = view([sway * 2, 52, -34]);
  const tip = view([sway * 4, 86, -24]);
  const z = (root.z + tip.z) / 2 + 1;
  const d = `M${point(root)}Q${point(bend)} ${point(tip)}`;
  const tieZ = root.z + 2;
  return [
    { d, z, stroke: INK, width: 11 },
    { d: ellipse(root.x, root.y, 5, 5), z: tieZ, fill: TRIM, stroke: INK, width: 2 },
  ];
}

function sparkler(view: View, hand: Vec3, spin: number): GuestShape[] {
  const tip = view([hand[0] + 5, hand[1] - 18, hand[2] + 2]);
  const base = view(hand);
  const rays = Array.from({ length: 16 }, (_, i) => {
    const radius = i % 2 ? 4.4 : 12;
    const a = (i * 22.5 + spin) * RADIANS;
    return `${n(tip.x + radius * Math.cos(a))} ${n(tip.y + radius * Math.sin(a))}`;
  });
  return [
    { d: `M${point(base)}L${point(tip)}`, z: base.z, stroke: INK, width: 2.6 },
    { d: `M${rays.join("L")}z`, z: base.z, fill: DRESS, stroke: INK, width: 2 },
  ];
}

/** Guest at `angle` degrees. `phase` is 0..1 around the clip and drives the secondary motion. */
export function buildGuest(angle: number, phase: number): GuestShape[] {
  const view = createView(angle);
  const turn = phase * 360 * RADIANS;
  const sway = 2.5 * Math.sin(turn * 2);
  const hand: Vec3 = [23, 26 + 3 * Math.sin(turn * 3), 12];

  const shapes = [
    ...limb(view, [[-8, 138, 0], [-8, 176, 0], [-8, 178, 9]], SKIN),
    ...limb(view, [[8, 138, 0], [8, 176, 0], [8, 178, 9]], SKIN),
    ...limb(view, [[0, 58, 0], [0, 74, 0]], SKIN, 12),
    ...limb(view, [[-13, 76, 0], [-27, 96, 5], [-12, 108, 9]], SKIN),
    ...limb(view, [[13, 76, 0], [27, 58, 8], hand], SKIN),
    ...sparkler(view, hand, phase * 720),
    ...hair(view, sway),
    ...head(view),
  ];
  // Legs always stand behind the skirt, whatever their depth.
  const ordered = shapes.map((s, i) => (i < 4 ? { ...s, z: s.z - 100 } : s));
  return [...ordered, ...dress(view, angle, sway)].sort((a, b) => a.z - b.z);
}

/** Ticks on the turntable: they circle under the guest and anchor the orbit. */
export function platformTicks(angle: number, radius: number, floorY: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const yaw = i * 30 * RADIANS;
    const { x, y, z } = createView(angle)([radius * Math.sin(yaw), floorY, radius * Math.cos(yaw)]);
    return { x: n(x), y: n(y), near: z > 0 };
  });
}
