import type { ComponentProps, ReactNode } from "react";
import * as THREE from "three";
import { Line, Outlines } from "@react-three/drei";
import {
  COLORS,
  createBodyMaterial,
  createCurtainTexture,
  createGlassTexture,
  createSignTexture,
  toonGradient,
  WHEEL_ARCH,
} from "./busArt";
import {
  bodyGeometry,
  bumperGeometry,
  createPane,
  doorWindow,
  HALF_WIDTH,
  HATCH_ANGLE,
  HATCH_HINGE,
  hatchWindow,
  rackPoints,
  RACK_Y,
  rearWindows,
  rimGeometry,
  seams,
  SIDE_TILT,
  sideTrack,
  SILL,
  tailOpening,
  WHEEL_RADIUS,
  windshield,
  windshieldCenter,
  windshieldNormal,
} from "./busGeometry";

const bodyMaterial = createBodyMaterial();
const curtainTexture = createCurtainTexture();
const glassTexture = createGlassTexture();
const signTexture = createSignTexture();

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

/** Double-sided: fat lines are screen-space quads, so the mirrored flank would cull them. */
function InkLine({
  lineWidth = 1.6,
  ...line
}: Omit<ComponentProps<typeof Line>, "color" | "side">) {
  return <Line {...line} color={COLORS.ink} lineWidth={lineWidth} side={THREE.DoubleSide} />;
}

function Wheel({ x }: { x: number }) {
  return (
    <group position={[x, WHEEL_RADIUS, 0.66]}>
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
            <InkLine key={i} points={points.map(([x, y]) => [x, y, 0.004])} />
          ))}
          <InkLine points={sideTrack.map(([x, y]) => [x, y, 0.004])} lineWidth={4} />
          {[-0.2, 0.16].map((x) => (
            <mesh key={x} position={[x, 1.07, 0.015]}>
              <boxGeometry args={[0.15, 0.05, 0.03]} />
              <meshBasicMaterial color={COLORS.ink} />
            </mesh>
          ))}
        </group>
      </group>

      <Wheel x={WHEEL_ARCH.axle} />
      <Wheel x={-WHEEL_ARCH.axle} />

      <group position={[1.855, 0.8, 0.5]} rotation-y={Math.PI / 2}>
        <mesh>
          <circleGeometry args={[0.15, 32]} />
          <meshToonMaterial color={COLORS.primarySoft} gradientMap={toonGradient} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.15, 0.024, 10, 32]} />
          <meshBasicMaterial color={COLORS.ink} />
        </mesh>
      </group>

      <mesh position={[-1.85, 0.72, 0.56]}>
        <boxGeometry args={[0.03, 0.26, 0.12]} />
        <meshBasicMaterial color={COLORS.neon} />
      </mesh>

      <InkLine
        points={[
          [-1.82, 1.4, 0.56],
          [HATCH_HINGE[0] - 0.75, 2.22, 0.56],
        ]}
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
          <meshBasicMaterial map={signTexture} />
        </mesh>
      ))}
      <InkLine
        segments
        points={[
          [-0.8, -0.29, 0],
          [-0.8, -0.33, 0],
          [0.8, -0.29, 0],
          [0.8, -0.33, 0],
        ]}
        lineWidth={3}
      />
    </group>
  );
}

function OpenHatch() {
  return (
    <group position={[HATCH_HINGE[0], HATCH_HINGE[1], 0]} rotation-z={HATCH_ANGLE}>
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

      {[0, Math.PI].map((angle) => (
        <group key={angle} rotation-y={angle}>
          <Toon
            geometry={bumperGeometry}
            color={COLORS.inkSoft}
            position={[1.84, 0.34, 0]}
            outline={0.016}
          />
        </group>
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
        <meshBasicMaterial map={curtainTexture} />
      </Pane>

      <BusFlank />
      <group scale-z={-1}>
        <BusFlank />
      </group>

      <InkLine segments points={rackPoints} lineWidth={2.4} />
      <RoofSign />
      <OpenHatch />
    </group>
  );
}
