import { useRef, type ComponentProps } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { COLORS, createBodyMaterial, createGlassTexture, doorCut } from "./busArt";
import {
  createPane,
  doorOutline,
  doorPanel,
  HATCH_CLOSED,
  HATCH_OPEN,
  hatchWindow,
  slidingDoorWindow,
} from "./busGeometry";
import { Toon } from "./Toon";

/** Sliding door travel along the side track, and how far it pops out to clear the body. */
const DOOR_SLIDE = 0.72;
const DOOR_POP = 0.05;
/** Strut foot on the tail, just proud of the paint, and its mount along the hatch. */
const STRUT_BASE: [number, number, number] = [-1.86, 1.4, 0.56];
const STRUT_MOUNT = 0.78;

const doorMaterial = createBodyMaterial(false);
const glassTexture = createGlassTexture();

export function Pane({
  pane,
  ...group
}: ComponentProps<"group"> & { pane: ReturnType<typeof createPane> }) {
  return (
    <group {...group}>
      <mesh geometry={pane.frame}>
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
      <mesh geometry={pane.glass} position-z={0.012}>
        <meshBasicMaterial map={glassTexture} />
      </mesh>
    </group>
  );
}

/** Double-sided: fat lines are screen-space quads, so the mirrored flank would cull them. */
export function InkLine({
  lineWidth = 1.6,
  ...line
}: Omit<ComponentProps<typeof Line>, "color" | "side">) {
  return <Line {...line} color={COLORS.ink} lineWidth={lineWidth} side={THREE.DoubleSide} />;
}

function Handle({ x }: { x: number }) {
  return (
    <mesh position={[x, 1.07, 0.025]}>
      <boxGeometry args={[0.15, 0.05, 0.03]} />
      <meshBasicMaterial color={COLORS.ink} />
    </mesh>
  );
}

/** Eases 0 to 1 toward the open state and hands each frame's value to `apply`. */
function useDoorProgress(open: boolean, apply: (progress: number) => void) {
  const progress = useRef(0);
  const reducedMotion = useReducedMotion();

  useFrame((_, delta) => {
    const target = open ? 1 : 0;
    progress.current = reducedMotion
      ? target
      : THREE.MathUtils.damp(progress.current, target, 4, delta);
    if (Math.abs(progress.current - target) < 0.002) progress.current = target;
    doorCut.value = progress.current;
    apply(progress.current);
  });
}

export function SlidingDoor({ open }: { open: boolean }) {
  const door = useRef<THREE.Group>(null);

  useDoorProgress(open, (progress) => {
    door.current!.position.set(
      -DOOR_SLIDE * THREE.MathUtils.smoothstep(progress, 0.15, 1),
      0,
      DOOR_POP * Math.min(progress / 0.15, 1),
    );
  });

  return (
    <group ref={door}>
      <mesh geometry={doorPanel} material={doorMaterial} />
      <InkLine points={[...doorOutline, doorOutline[0]].map(([x, y]) => [x, y, 0.012])} />
      <Pane pane={slidingDoorWindow} position-z={0.011} />
      <Handle x={-0.2} />
    </group>
  );
}

function hatchPose(progress: number) {
  const { lerp } = THREE.MathUtils;
  return {
    x: lerp(HATCH_CLOSED.pivot[0], HATCH_OPEN.pivot[0], progress),
    y: lerp(HATCH_CLOSED.pivot[1], HATCH_OPEN.pivot[1], progress),
    angle: lerp(HATCH_CLOSED.angle, HATCH_OPEN.angle, progress),
  };
}

/** Stays shut over the tail and lifts with the doors to reveal the rear nook. */
export function Hatch({ open }: { open: boolean }) {
  const hatch = useRef<THREE.Group>(null);

  useDoorProgress(open, (progress) => {
    const { x, y, angle } = hatchPose(progress);
    hatch.current!.position.set(x, y, 0);
    hatch.current!.rotation.z = angle;
  });

  return (
    <group ref={hatch}>
      <Toon color={COLORS.paper} position-x={-0.4}>
        <boxGeometry args={[0.8, 0.05, 1.26]} />
      </Toon>
      <Toon color={COLORS.primary} position-x={-0.96}>
        <boxGeometry args={[0.32, 0.05, 1.26]} />
      </Toon>
      <Pane pane={hatchWindow} position-y={0.027} rotation-x={-Math.PI / 2} />
    </group>
  );
}

/** Re-aimed every frame at its mount, so it never swings through the body or the hatch. */
export function HatchStrut({ open }: { open: boolean }) {
  const strut = useRef<THREE.Group>(null);

  useDoorProgress(open, (progress) => {
    const { x, y, angle } = hatchPose(progress);
    const reachX = x - Math.cos(angle) * STRUT_MOUNT - STRUT_BASE[0];
    const reachY = y - Math.sin(angle) * STRUT_MOUNT - STRUT_BASE[1];
    strut.current!.rotation.z = Math.atan2(reachY, reachX);
    strut.current!.scale.x = Math.hypot(reachX, reachY);
  });

  return (
    <group ref={strut} position={STRUT_BASE}>
      <InkLine points={[[0, 0, 0], [1, 0, 0]]} lineWidth={2} />
    </group>
  );
}
