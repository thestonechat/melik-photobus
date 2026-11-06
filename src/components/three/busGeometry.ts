import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DOOR, TAIL, WHEEL_ARCH } from "./busArt";

export type Point2 = [number, number];
export type Point3 = [number, number, number];

export const SILL = 0.38;
export const HALF_WIDTH = 0.8;
const BEVEL = 0.1;
const ROOF_Y = 2;
export const WHEEL_RADIUS = 0.28;
/** Body sides lean inward by this fraction of their width per unit of height. */
const LEAN = 0.13;
export const SIDE_TILT = Math.atan(HALF_WIDTH * LEAN);
export const RACK_Y = 2.14;
/** Hatch pivot and tilt in each pose; the closed pose lies flat over the tail. */
export const HATCH_OPEN = { pivot: [-1.66, 1.98] as Point2, angle: -0.32 };
export const HATCH_CLOSED = { pivot: [-1.86, 1.9] as Point2, angle: 1.54 };

function roundedShape(corners: Point2[], radius: number) {
  const points = corners.map(([x, y]) => new THREE.Vector2(x, y));
  const shape = new THREE.Shape();
  points.forEach((point, i) => {
    const prev = points.at(i - 1)!;
    const next = points[(i + 1) % points.length];
    const entry = point.clone().lerp(prev, radius / point.distanceTo(prev));
    const exit = point.clone().lerp(next, radius / point.distanceTo(next));
    if (i === 0) shape.moveTo(entry.x, entry.y);
    else shape.lineTo(entry.x, entry.y);
    shape.quadraticCurveTo(point.x, point.y, exit.x, exit.y);
  });
  shape.closePath();
  return shape;
}

function createBodyGeometry() {
  const profile = new THREE.Shape();
  profile.moveTo(-1.75, SILL);
  for (const axle of [-WHEEL_ARCH.axle, WHEEL_ARCH.axle]) {
    profile.absarc(axle, WHEEL_ARCH.y, WHEEL_ARCH.radius, Math.PI, 0, true);
  }
  profile.lineTo(1.72, SILL);
  profile.quadraticCurveTo(1.76, SILL, 1.76, 0.46);
  profile.lineTo(1.74, 1.02);
  profile.quadraticCurveTo(1.72, 1.16, 1.58, 1.2);
  profile.lineTo(0.95, 1.78);
  profile.quadraticCurveTo(0.82, 1.9, 0.6, 1.91);
  profile.quadraticCurveTo(-0.5, 1.94, -1.5, 1.9);
  profile.quadraticCurveTo(-1.7, 1.9, -1.72, 1.7);
  profile.lineTo(-1.75, 0.5);
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

function plate(shape: THREE.Shape, border = 0) {
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.01,
    bevelEnabled: border > 0,
    bevelSize: border,
    bevelThickness: 0.001,
    bevelSegments: 1,
    curveSegments: 8,
  });
}

export function createPane(corners: Point2[], radius = 0.07) {
  const shape = roundedShape(corners, radius);
  return { glass: plate(shape), frame: plate(shape, 0.035) };
}

function createRimGeometry() {
  const rim = new THREE.Shape().absarc(0, 0, 0.18, 0, Math.PI * 2);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    rim.holes.push(
      new THREE.Path().absarc(Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, 0.028, 0, Math.PI * 2),
    );
  }
  return plate(rim);
}

function createBumperGeometry() {
  const plan = roundedShape([[-0.12, -0.82], [0.1, -0.82], [0.1, 0.82], [-0.12, 0.82]], 0.09);
  const geometry = new THREE.ExtrudeGeometry(plan, { depth: 0.17, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function createRackPoints() {
  const points: Point3[] = [];
  const segment = (from: Point3, to: Point3) => points.push(from, to);
  const [back, front, half] = [-1.3, 0.95, 0.62];

  for (const z of [-half, half, -half + 0.04, half - 0.04]) {
    segment([back, RACK_Y, z], [front, RACK_Y, z]);
  }
  for (let x = back; x <= front + 0.01; x += 0.225) {
    segment([x, RACK_Y, -half], [x, RACK_Y, half]);
  }
  for (const x of [back + 0.1, -0.25, front - 0.1]) {
    for (const z of [-half, half]) {
      segment([x, RACK_Y, z], [x, ROOF_Y - 0.1, z * 0.9]);
    }
  }
  return points;
}

export const bodyGeometry = createBodyGeometry();
export const rimGeometry = createRimGeometry();
export const bumperGeometry = createBumperGeometry();
export const rackPoints = createRackPoints();

export const rearWindow = createPane([[-1.58, 1.24], [-0.92, 1.24], [-0.92, 1.76], [-1.58, 1.76]]);
export const slidingDoorWindow = createPane([[-0.8, 1.24], [-0.06, 1.24], [-0.06, 1.76], [-0.8, 1.76]]);
export const doorWindow = createPane([[0.08, 1.24], [1.22, 1.24], [0.74, 1.76], [0.08, 1.76]]);
export const windshield = createPane([[-0.56, -0.36], [0.56, -0.36], [0.44, 0.36], [-0.44, 0.36]], 0.09);
export const hatchWindow = createPane([[-0.74, -0.46], [-0.14, -0.46], [-0.14, 0.46], [-0.74, 0.46]]);

function createTailFrame() {
  const narrowTop = TAIL.base - TAIL.taper * (TAIL.top - TAIL.bottom);
  const frame = roundedShape([[-0.63, 0.86], [0.63, 0.86], [0.57, 1.76], [-0.57, 1.76]], 0.1);
  frame.holes.push(
    roundedShape(
      [[-TAIL.base, TAIL.bottom], [TAIL.base, TAIL.bottom], [narrowTop, TAIL.top], [-narrowTop, TAIL.top]],
      0.07,
    ),
  );
  return plate(frame);
}
export const tailFrame = createTailFrame();

const windshieldSlope = new THREE.Vector2(0.95 - 1.58, 1.78 - 1.2).normalize();
export const windshieldNormal = new THREE.Vector2(windshieldSlope.y, -windshieldSlope.x);
export const windshieldCenter = new THREE.Vector2(1.265, 1.49).addScaledVector(windshieldNormal, BEVEL);

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
export function createRoomGeometry(rear: number, front: number, bottom: number, top: number) {
  const inner = 0.02;
  const outer = 0.76;
  const geometry = new THREE.BoxGeometry(front - rear, top - bottom, outer - inner);
  geometry.translate((front + rear) / 2, (top + bottom) / 2, (outer + inner) / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setZ(i, position.getZ(i) * (1 - LEAN * (position.getY(i) - SILL)));
  }
  return geometry;
}

export const seams: Point2[][] = [
  [[1.33, 0.72], [1.42, 1.2], [0.82, 1.84], [0.02, 1.84], [0.02, 0.46], [0.53, 0.46]],
  doorOutline,
];
export const sideTrack: Point2[] = [[-1.72, 1], [-0.97, 1]];
