import type { ComponentProps, ReactNode } from "react";
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Line, Outlines } from "@react-three/drei";
import {
  COLORS,
  createBodyMaterial,
  createCurtainTexture,
  createGlassTexture,
  createSignTexture,
  toonGradient,
} from "./busArt";

type Point2 = [number, number];
type Point3 = [number, number, number];

const SILL = 0.38;
const HALF_WIDTH = 0.8;
const BEVEL = 0.1;
const ROOF_Y = 2;
const AXLE = 1;
const WHEEL_RADIUS = 0.31;
const ARCH_RADIUS = 0.5;
/** Body sides lean inward by this fraction of their width per unit of height. */
const LEAN = 0.13;
const SIDE_TILT = Math.atan(HALF_WIDTH * LEAN);
const RACK_Y = 2.14;
const HATCH_HINGE: Point2 = [-1.66, 1.98];
const HATCH_ANGLE = -0.32;

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
  for (const axle of [-AXLE, AXLE]) {
    profile.absarc(axle, SILL, ARCH_RADIUS, Math.PI, 0, true);
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

function createPane(corners: Point2[], radius = 0.07) {
  const shape = roundedShape(corners, radius);
  return { glass: plate(shape), frame: plate(shape, 0.035) };
}

function createRimGeometry() {
  const rim = new THREE.Shape().absarc(0, 0, 0.2, 0, Math.PI * 2);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    rim.holes.push(
      new THREE.Path().absarc(Math.cos(angle) * 0.135, Math.sin(angle) * 0.135, 0.03, 0, Math.PI * 2),
    );
  }
  return plate(rim);
}

function createRackPoints() {
  const points: Point3[] = [];
  const segment = (from: Point3, to: Point3) => points.push(from, to);
  const [back, front, half] = [-1.5, 1, 0.62];

  for (const z of [-half, half, -half + 0.04, half - 0.04]) {
    segment([back, RACK_Y, z], [front, RACK_Y, z]);
  }
  for (let x = back; x <= front + 0.01; x += 0.208) {
    segment([x, RACK_Y, -half], [x, RACK_Y, half]);
  }
  for (const x of [back + 0.1, -0.25, front - 0.1]) {
    for (const z of [-half, half]) {
      segment([x, RACK_Y, z], [x, ROOF_Y - 0.1, z * 0.9]);
    }
  }
  return points;
}

const bodyGeometry = createBodyGeometry();
const bodyMaterial = createBodyMaterial();
const rimGeometry = createRimGeometry();
const rackPoints = createRackPoints();
const curtainTexture = createCurtainTexture();
const glassTexture = createGlassTexture();
const signTexture = createSignTexture();

const rearWindows = [
  createPane([[-1.58, 1.24], [-0.92, 1.24], [-0.92, 1.76], [-1.58, 1.76]]),
  createPane([[-0.8, 1.24], [-0.06, 1.24], [-0.06, 1.76], [-0.8, 1.76]]),
];
const doorWindow = createPane([[0.08, 1.24], [1.22, 1.24], [0.74, 1.76], [0.08, 1.76]]);
const windshield = createPane([[-0.6, -0.4], [0.6, -0.4], [0.53, 0.4], [-0.53, 0.4]], 0.1);
const hatchWindow = createPane([[-0.98, -0.46], [-0.16, -0.46], [-0.16, 0.46], [-0.98, 0.46]]);
const tailOpening = createPane([[-0.6, 0.92], [0.6, 0.92], [0.54, 1.7], [-0.54, 1.7]]);

const windshieldSlope = new THREE.Vector2(0.95 - 1.58, 1.78 - 1.2).normalize();
const windshieldNormal = new THREE.Vector2(windshieldSlope.y, -windshieldSlope.x);
const windshieldCenter = new THREE.Vector2(1.265, 1.49).addScaledVector(windshieldNormal, BEVEL);

const seams: Point2[][] = [
  [[1.33, 0.84], [1.42, 1.2], [0.82, 1.84], [0.02, 1.84], [0.02, 0.46], [0.5, 0.46]],
  [[0.02, 1.84], [-0.96, 1.84], [-0.96, 0.46], [0.02, 0.46]],
];
const sideTrack: Point2[] = [[-1.72, 1], [-0.97, 1]];

function Toon({
  color,
  outline = 0.024,
  children,
  ...mesh
}: ComponentProps<"mesh"> & { color: string; outline?: number; children?: ReactNode }) {
  return (
    <mesh {...mesh}>
      {children}
      <meshToonMaterial color={color} gradientMap={toonGradient} />
      <Outlines screenspace thickness={outline} color={COLORS.ink} />
    </mesh>
  );
}

function Pane({
  pane,
  children,
  ...group
}: ComponentProps<"group"> & { pane: ReturnType<typeof createPane>; children: ReactNode }) {
  return (
    <group {...group}>
      <mesh geometry={pane.frame}>
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
      <mesh geometry={pane.glass} position-z={0.012}>
        {children}
      </mesh>
    </group>
  );
}

function Wheel({ x }: { x: number }) {
  return (
    <group position={[x, WHEEL_RADIUS, 0.68]}>
      <Toon color={COLORS.inkSoft} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.26, 40]} />
      </Toon>
      <mesh geometry={rimGeometry} position-z={0.13}>
        <meshToonMaterial color={COLORS.paperSoft} gradientMap={toonGradient} />
      </mesh>
    </group>
  );
}

/** Everything that exists once per flank; the bus renders it twice, mirrored. */
function BusFlank() {
  return (
    <>
      <group position={[0, SILL, HALF_WIDTH]} rotation-x={-SIDE_TILT}>
        <group position-y={-SILL}>
          {rearWindows.map((pane, i) => (
            <Pane key={i} pane={pane}>
              <meshBasicMaterial map={curtainTexture} />
            </Pane>
          ))}
          <Pane pane={doorWindow}>
            <meshBasicMaterial map={glassTexture} />
          </Pane>
          {seams.map((points, i) => (
            <Line
              key={i}
              points={points.map(([x, y]) => [x, y, 0.004])}
              color={COLORS.ink}
              lineWidth={1.6}
            />
          ))}
          <Line
            points={sideTrack.map(([x, y]) => [x, y, 0.004])}
            color={COLORS.ink}
            lineWidth={4}
          />
          {[-0.2, 0.16].map((x) => (
            <mesh key={x} position={[x, 1.07, 0.015]}>
              <boxGeometry args={[0.15, 0.05, 0.03]} />
              <meshBasicMaterial color={COLORS.ink} />
            </mesh>
          ))}
        </group>
      </group>

      <Wheel x={AXLE} />
      <Wheel x={-AXLE} />

      <group position={[1.85, 0.8, 0.5]} rotation-y={Math.PI / 2}>
        <mesh>
          <circleGeometry args={[0.13, 32]} />
          <meshToonMaterial color={COLORS.primarySoft} gradientMap={toonGradient} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.13, 0.022, 10, 32]} />
          <meshBasicMaterial color={COLORS.ink} />
        </mesh>
      </group>

      <mesh position={[-1.85, 0.72, 0.56]}>
        <boxGeometry args={[0.03, 0.26, 0.12]} />
        <meshBasicMaterial color={COLORS.neon} />
      </mesh>

      <Line
        points={[
          [-1.82, 1.4, 0.56],
          [HATCH_HINGE[0] - 0.75, 2.22, 0.56],
        ]}
        color={COLORS.ink}
        lineWidth={2}
      />
    </>
  );
}

function RoofSign() {
  return (
    <group position={[-0.25, RACK_Y + 0.33, 0]}>
      <Toon color={COLORS.ink} outline={0.018}>
        <boxGeometry args={[2.3, 0.575, 0.05]} />
      </Toon>
      {[0, Math.PI].map((angle) => (
        <mesh key={angle} rotation-y={angle} position-z={angle ? -0.026 : 0.026}>
          <planeGeometry args={[2.3, 0.575]} />
          <meshBasicMaterial map={signTexture} toneMapped={false} />
        </mesh>
      ))}
      <Line
        segments
        points={[
          [-0.8, -0.29, 0],
          [-0.8, -0.33, 0],
          [0.8, -0.29, 0],
          [0.8, -0.33, 0],
        ]}
        color={COLORS.ink}
        lineWidth={3}
      />
    </group>
  );
}

function OpenHatch() {
  return (
    <group position={[...HATCH_HINGE, 0]} rotation-z={HATCH_ANGLE}>
      <Toon color={COLORS.paper} position-x={-0.56}>
        <boxGeometry args={[1.12, 0.05, 1.2]} />
      </Toon>
      <Pane pane={hatchWindow} position-y={0.027} rotation-x={-Math.PI / 2}>
        <meshBasicMaterial map={glassTexture} />
      </Pane>
    </group>
  );
}

export function PhotoBus() {
  return (
    <group position-x={0.3}>
      <mesh geometry={bodyGeometry} material={bodyMaterial}>
        <Outlines screenspace thickness={0.026} color={COLORS.ink} />
      </mesh>

      <mesh position-y={0.44}>
        <boxGeometry args={[3.5, 0.34, 1.3]} />
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>

      {[1.84, -1.84].map((x) => (
        <Toon key={x} color={COLORS.inkSoft} position={[x, 0.42, 0]} outline={0.016}>
          <boxGeometry args={[0.14, 0.17, 1.7]} />
        </Toon>
      ))}

      <group
        position={[windshieldCenter.x, windshieldCenter.y, 0]}
        rotation-z={windshieldNormal.angle()}
      >
        <Pane pane={windshield} rotation-y={Math.PI / 2}>
          <meshBasicMaterial map={glassTexture} />
        </Pane>
      </group>

      <Pane pane={tailOpening} position-x={-1.855} rotation-y={-Math.PI / 2}>
        <meshBasicMaterial color={COLORS.primarySoft} />
      </Pane>

      <BusFlank />
      <group scale-z={-1}>
        <BusFlank />
      </group>

      <Line segments points={rackPoints} color={COLORS.ink} lineWidth={2.4} />
      <RoofSign />
      <OpenHatch />
    </group>
  );
}
