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
  HATCH,
  hatchLower,
  hatchUpper,
  hatchWindow,
  slidingDoorWindow,
} from "./busGeometry";
import { Toon } from "./Toon";

/** Sliding door travel along the side track, and how far it pops out to clear the body. */
const DOOR_SLIDE = 0.8;
const DOOR_POP = 0.06;
/** Strut foot just inside the tail opening, so the closed strut hides behind the hatch. */
const STRUT_FOOT: [number, number, number] = [-1.93, 1, 0.5];
/** Strut mount, measured down the hatch from the hinge. */
const STRUT_MOUNT = 0.42;
const STRUT_BODY_LENGTH = 0.46;

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

/** Steel grip in a dark recess; the cab door's lies flat, the sliding door's stands up. */
export function Handle({ x, upright = false }: { x: number; upright?: boolean }) {
  const [wide, tall] = upright ? [0.05, 0.16] : [0.16, 0.05];
  return (
    <group position={[x, 0.97, 0.012]}>
      <mesh>
        <boxGeometry args={[wide + 0.03, tall + 0.03, 0.01]} />
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
      <mesh position-z={0.01}>
        <boxGeometry args={[wide, tall, 0.016]} />
        <meshBasicMaterial color={COLORS.steel} />
      </mesh>
    </group>
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
      <Handle x={-0.06} upright />
    </group>
  );
}

const hatchAngle = (progress: number) =>
  THREE.MathUtils.lerp(HATCH.closedAngle, HATCH.openAngle, progress);

/** Stays shut over the tail and swings on its roof hinge to reveal the rear nook. */
export function Hatch({ open }: { open: boolean }) {
  const hatch = useRef<THREE.Group>(null);

  useDoorProgress(open, (progress) => {
    hatch.current!.rotation.z = hatchAngle(progress);
  });

  return (
    <group ref={hatch} position={[HATCH.hinge[0], HATCH.hinge[1], 0]}>
      <Toon geometry={hatchUpper} color={COLORS.paper} outline={0.018} />
      <Toon geometry={hatchLower} color={COLORS.mustard} outline={0.018} />
      <Pane pane={hatchWindow} position-y={HATCH.thickness + 0.002} rotation-x={-Math.PI / 2} />
      <Pane pane={hatchWindow} position-y={-0.002} rotation-x={Math.PI / 2} />
    </group>
  );
}

/** Re-aimed every frame at its mount; the rod telescopes out of a fixed gas cylinder. */
export function HatchStrut({ open }: { open: boolean }) {
  const strut = useRef<THREE.Group>(null);
  const rod = useRef<THREE.Group>(null);

  useDoorProgress(open, (progress) => {
    const angle = hatchAngle(progress);
    const reachX = HATCH.hinge[0] - Math.cos(angle) * STRUT_MOUNT - STRUT_FOOT[0];
    const reachY = HATCH.hinge[1] - Math.sin(angle) * STRUT_MOUNT - STRUT_FOOT[1];
    strut.current!.rotation.z = Math.atan2(reachY, reachX);
    rod.current!.scale.x = Math.hypot(reachX, reachY);
  });

  return (
    <group ref={strut} position={STRUT_FOOT}>
      <group ref={rod}>
        <InkLine points={[[0, 0, 0], [1, 0, 0]]} lineWidth={1.6} />
      </group>
      <InkLine points={[[0, 0, 0], [STRUT_BODY_LENGTH, 0, 0]]} lineWidth={3.6} />
    </group>
  );
}
