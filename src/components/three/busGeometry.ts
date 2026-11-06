import * as THREE from "three";
import { mergeVertices, toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DOOR, TAIL, WHEEL_ARCH } from "./busArt";

export type Point2 = [number, number];
export type Point3 = [number, number, number];

export const SILL = 0.38;
export const HALF_WIDTH = 0.8;
const BEVEL = 0.1;
export const WHEEL_RADIUS = 0.28;
/** Body sides lean inward by this fraction of their width per unit of height. */
const LEAN = 0.13;
export const SIDE_TILT = Math.atan(HALF_WIDTH * LEAN);
export const RACK_Y = 2.16;
/** The tail leans forward by this angle from vertical. */
export const TAIL_RAKE = Math.atan2(0.085, 1.3);
/** Painted tail surface: x at y = 0, where the plan view meets the ground. */
export const TAIL_X = -1.98 - 0.5 * Math.tan(TAIL_RAKE);
/** Hatch hinge at the roof edge; its panel runs `length` down the tail when closed. */
export const HATCH = {
  hinge: [TAIL_X + 1.96 * Math.tan(TAIL_RAKE), 1.96] as Point2,
  closedAngle: Math.PI / 2 - TAIL_RAKE,
  openAngle: -0.55,
  length: 1.46,
  thickness: 0.05,
  paintSplit: 0.88,
};


function roundedShape(corners: Point2[], radius: number | number[]) {
  const points = corners.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = new THREE.Shape();
  points.forEach((point, i) => {
    const prev = points.at(i - 1)!;
    const next = points[(i + 1) % points.length];
    const corner = typeof radius === "number" ? radius : radius[i];
    const entry = point.clone().lerp(prev, corner / point.distanceTo(prev));
    const exit = point.clone().lerp(next, corner / point.distanceTo(next));
    if (i === 0) shape.moveTo(entry.x, entry.y);
    else shape.lineTo(entry.x, entry.y);
    shape.quadraticCurveTo(point.x, point.y, exit.x, exit.y);
  });
  shape.closePath();
  return shape;
}

/** Bottom and top of the raked windshield on the body profile. */
const COWL: Point2 = [1.74, 1.24];
const HEADER: Point2 = [1.12, 1.82];

function createBodyGeometry() {
  const profile = new THREE.Shape();
  profile.moveTo(-1.86, SILL);
  for (const axle of [-WHEEL_ARCH.axle, WHEEL_ARCH.axle]) {
    profile.absarc(axle, WHEEL_ARCH.y, WHEEL_ARCH.radius, Math.PI, 0, true);
  }
  profile.lineTo(1.84, SILL);
  profile.quadraticCurveTo(1.88, SILL, 1.88, 0.46);
  profile.lineTo(1.85, 1.06);
  profile.quadraticCurveTo(1.84, 1.18, COWL[0], COWL[1]);
  profile.lineTo(HEADER[0], HEADER[1]);
  profile.quadraticCurveTo(1.02, 1.91, 0.82, 1.92);
  profile.quadraticCurveTo(-0.6, 1.95, -1.7, 1.9);
  profile.quadraticCurveTo(-1.78, 1.9, -1.795, 1.8);
  profile.lineTo(-1.88, 0.5);
  profile.closePath();

  const depth = 2 * (HALF_WIDTH - BEVEL);
  const geometry = new THREE.ExtrudeGeometry(profile, {
    depth,
    bevelSize: BEVEL,
    bevelThickness: BEVEL,
    bevelSegments: 6,
    curveSegments: 20,
  });
  geometry.translate(0, 0, -depth / 2);

  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setZ(i, position.getZ(i) * (1 - LEAN * (position.getY(i) - SILL)));
  }
  return toCreasedNormals(geometry, Math.PI / 4);
}

function plate(shape: THREE.Shape, border = 0, depth = 0.01) {
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: border > 0,
    bevelSize: border,
    bevelThickness: 0.001,
    bevelSegments: 1,
    curveSegments: 8,
  });
}

export function createPane(corners: Point2[], radius = 0.07) {
  const shape = roundedShape(corners, radius);
  return { glass: plate(shape), frame: plate(shape, 0.042) };
}

const RIM_HOLES = 10;

function createRimGeometry() {
  const rim = new THREE.Shape().absarc(0, 0, 0.185, 0, Math.PI * 2);
  for (let i = 0; i < RIM_HOLES; i++) {
    const angle = (i / RIM_HOLES) * Math.PI * 2;
    rim.holes.push(
      new THREE.Path().absarc(Math.cos(angle) * 0.125, Math.sin(angle) * 0.125, 0.024, 0, Math.PI * 2),
    );
  }
  return plate(rim);
}

function createBumperGeometry() {
  const plan = roundedShape([[-0.16, -0.84], [0.08, -0.84], [0.08, 0.84], [-0.16, 0.84]], 0.1);
  const geometry = new THREE.ExtrudeGeometry(plan, { depth: 0.14, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  return mergeVertices(geometry);
}

const RACK = { back: -1.72, front: 0.98, half: 0.6, slatGap: 0.15, footY: 1.95 };
export const rackFeet: Point2[] = [RACK.back + 0.12, -0.38, RACK.front - 0.12].flatMap((x) => [
  [x, -RACK.half],
  [x, RACK.half],
]);

function createRackFrame() {
  const { back, front, half, footY } = RACK;
  const segment = (from: Point3, to: Point3): Point3[] => [from, to];
  return [
    ...[-half, half].flatMap((z) => segment([back, RACK_Y, z], [front, RACK_Y, z])),
    ...[back, front].flatMap((x) => segment([x, RACK_Y, -half], [x, RACK_Y, half])),
    ...rackFeet.flatMap(([x, z]) => segment([x, RACK_Y, z], [x, footY, z])),
  ];
}

function createRackSlats() {
  const count = Math.floor((RACK.front - RACK.back) / RACK.slatGap);
  return Array.from({ length: count }, (_, i): Point3[] => {
    const x = RACK.back + (i + 0.5) * ((RACK.front - RACK.back) / count);
    return [[x, RACK_Y, -RACK.half], [x, RACK_Y, RACK.half]];
  }).flat();
}

export const bodyGeometry = createBodyGeometry();
export const rimGeometry = createRimGeometry();
export const bumperGeometry = createBumperGeometry();
export const rackFrame = createRackFrame();
export const rackSlats = createRackSlats();

export const rearWindow = createPane([[-1.84, 1.22], [-1.2, 1.22], [-1.2, 1.78], [-1.78, 1.78]], 0.09);
export const slidingDoorWindow = createPane([[-1.02, 1.22], [-0.04, 1.22], [-0.04, 1.78], [-1.02, 1.78]]);
export const doorWindow = createPane([[0.16, 1.22], [1.48, 1.22], [0.98, 1.78], [0.16, 1.78]]);
export const windshield = createPane([[-0.62, -0.42], [0.62, -0.42], [0.54, 0.4], [-0.54, 0.4]], 0.07);

/** Half width of the hatch at a distance down from the hinge. */
const hatchHalf = (distance: number) => 0.53 + 0.09 * distance;

function hatchPanel(from: number, to: number, radii: number[]) {
  const corners: Point2[] = [
    [-from, -hatchHalf(from)],
    [-from, hatchHalf(from)],
    [-to, hatchHalf(to)],
    [-to, -hatchHalf(to)],
  ];
  const geometry = new THREE.ExtrudeGeometry(roundedShape(corners, radii), {
    depth: HATCH.thickness,
    bevelEnabled: false,
  });
  geometry.rotateX(-Math.PI / 2);
  return mergeVertices(geometry);
}

const SHARP = 0.002;
const HATCH_CORNER = 0.09;
export const hatchUpper = hatchPanel(0, HATCH.paintSplit, [HATCH_CORNER, HATCH_CORNER, SHARP, SHARP]);
export const hatchLower = hatchPanel(HATCH.paintSplit, HATCH.length, [SHARP, SHARP, HATCH_CORNER, HATCH_CORNER]);
export const hatchWindow = createPane(
  [[-0.14, -hatchHalf(0.14) + 0.07], [-0.14, hatchHalf(0.14) - 0.07], [-0.76, hatchHalf(0.76) - 0.07], [-0.76, -hatchHalf(0.76) + 0.07]],
);

const TAIL_LIP_DEPTH = 0.14;

function createTailFrame() {
  const narrowTop = TAIL.base - TAIL.taper * (TAIL.top - TAIL.bottom);
  const frame = roundedShape([[-0.64, 0.5], [0.64, 0.5], [0.53, 1.86], [-0.53, 1.86]], 0.1);
  frame.holes.push(
    roundedShape(
      [[-TAIL.base, TAIL.bottom], [TAIL.base, TAIL.bottom], [narrowTop, TAIL.top], [-narrowTop, TAIL.top]],
      0.07,
    ),
  );
  return plate(frame, 0, TAIL_LIP_DEPTH);
}
export const tailFrame = createTailFrame();
export const TAIL_FRAME_X = TAIL_X + TAIL_LIP_DEPTH - 0.006;

const windshieldSlope = new THREE.Vector2(HEADER[0] - COWL[0], HEADER[1] - COWL[1]).normalize();
export const windshieldNormal = new THREE.Vector2(windshieldSlope.y, -windshieldSlope.x);
export const windshieldCenter = new THREE.Vector2((COWL[0] + HEADER[0]) / 2, (COWL[1] + HEADER[1]) / 2 + 0.02)
  .addScaledVector(windshieldNormal, BEVEL);

export const doorOutline: Point2[] = [
  [DOOR.front, DOOR.top],
  [DOOR.rear, DOOR.top],
  [DOOR.rear, DOOR.notchTop],
  [DOOR.notch, DOOR.notchTop],
  [DOOR.notch, DOOR.bottom],
  [DOOR.front, DOOR.bottom],
];
export const doorPanel = plate(roundedShape(doorOutline, 0.02));

/**
 * Interior shell shaped to the leaning body, so its walls stay inside the paint.
 */
export function createRoomGeometry(
  rear: number,
  front: number,
  bottom: number,
  top: number,
  inner = 0.02,
  outer = 0.78,
) {
  const geometry = new THREE.BoxGeometry(front - rear, top - bottom, outer - inner);
  geometry.translate((front + rear) / 2, (top + bottom) / 2, (outer + inner) / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setZ(i, position.getZ(i) * (1 - LEAN * (position.getY(i) - SILL)));
  }
  return geometry;
}

export const seams: Point2[][] = [
  [[1.34, 0.72], [1.56, 1.2], [1.02, 1.84], [DOOR.front, 1.84], [DOOR.front, DOOR.bottom], [0.66, DOOR.bottom]],
  doorOutline,
];
export const SIDE_TRACK = { rear: -1.86, front: -0.7, y: 0.9 };

/** Chrome step filling the door threshold up to the cabin floor, inside the body paint. */
export const DOOR_STEP = {
  position: [(DOOR.notch + DOOR.front) / 2, 0.54, 0.695] as Point3,
  size: [DOOR.front - DOOR.notch, 0.16, 0.16] as Point3,
};
