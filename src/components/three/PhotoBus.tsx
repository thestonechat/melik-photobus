import { useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Outlines, useCursor } from "@react-three/drei";
import {
  COLORS,
  createBodyMaterial,
  toonGradient,
  WHEEL_ARCH,
} from "./busArt";
import {
  bodyGeometry,
  bumperGeometry,
  doorWindow,
  HALF_WIDTH,
  rackPoints,
  rearWindow,
  rimGeometry,
  seams,
  SIDE_TILT,
  sideTrack,
  SILL,
  WHEEL_RADIUS,
  windshield,
  windshieldCenter,
  windshieldNormal,
} from "./busGeometry";
import { Cabin, RearNook } from "./BusInterior";
import { Hatch, HatchStrut, InkLine, Pane, SlidingDoor } from "./BusDoors";
import { Headlight, HeadlightPool, RoofSign } from "./BusLights";
import { Toon } from "./Toon";

const DRAG_THRESHOLD_PX = 4;

const bodyMaterial = createBodyMaterial(true);

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
function BusFlank({ doorOpen }: { doorOpen: boolean }) {
  return (
    <>
      <Cabin />
      <group position={[0, SILL, HALF_WIDTH]} rotation-x={-SIDE_TILT}>
        <group position-y={-SILL}>
          <Pane pane={rearWindow} />
          <Pane pane={doorWindow} />
          <mesh position={[0.16, 1.07, 0.015]}>
            <boxGeometry args={[0.15, 0.05, 0.03]} />
            <meshBasicMaterial color={COLORS.ink} />
          </mesh>
          {seams.map((points, i) => (
            <InkLine key={i} points={points.map(([x, y]) => [x, y, 0.004])} />
          ))}
          <InkLine points={sideTrack.map(([x, y]) => [x, y, 0.004])} lineWidth={4} />
          <SlidingDoor open={doorOpen} />
        </group>
      </group>

      <Wheel x={WHEEL_ARCH.axle} />
      <Wheel x={-WHEEL_ARCH.axle} />

      <group position={[1.855, 0.8, 0.5]} rotation-y={Math.PI / 2}>
        <Headlight />
      </group>

      <mesh position={[-1.85, 0.72, 0.56]}>
        <boxGeometry args={[0.03, 0.26, 0.12]} />
        <meshBasicMaterial color={COLORS.neon} />
      </mesh>

      <HatchStrut open={doorOpen} />
    </>
  );
}

export function PhotoBus({ doorOpen, onToggleDoor }: { doorOpen: boolean; onToggleDoor: () => void }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta <= DRAG_THRESHOLD_PX) onToggleDoor();
  };

  return (
    <group
      position-x={0.3}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
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
        <Pane pane={windshield} rotation-y={Math.PI / 2} />
      </group>

      <RearNook />
      <BusFlank doorOpen={doorOpen} />
      <group scale-z={-1}>
        <BusFlank doorOpen={doorOpen} />
      </group>

      <InkLine segments points={rackPoints} lineWidth={2.4} />
      <RoofSign />
      <Hatch open={doorOpen} />
      <HeadlightPool />
    </group>
  );
}
