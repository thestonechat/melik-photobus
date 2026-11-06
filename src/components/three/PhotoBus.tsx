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
  rackFeet,
  rackFrame,
  rackSlats,
  RACK_Y,
  rearWindow,
  rimGeometry,
  seams,
  SIDE_TILT,
  SIDE_TRACK,
  SILL,
  WHEEL_RADIUS,
  windshield,
  windshieldCenter,
  windshieldNormal,
} from "./busGeometry";
import { Cabin, RearNook } from "./BusInterior";
import { Handle, Hatch, HatchStrut, InkLine, Pane, SlidingDoor } from "./BusDoors";
import { Headlight, HeadlightPool, RoofSign } from "./BusLights";
import { Toon } from "./Toon";

const DRAG_THRESHOLD_PX = 4;

/** Keeps the long open hatch and the nose equally clear of the canvas edge when orbiting. */
const BUS_OFFSET_X = 0.46;

const bodyMaterial = createBodyMaterial(true);

function Wheel({ x }: { x: number }) {
  return (
    <group position={[x, WHEEL_RADIUS, 0.64]}>
      <Toon color={COLORS.inkSoft} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.26, 40]} />
      </Toon>
      <mesh geometry={rimGeometry} position-z={0.13}>
        <meshToonMaterial color={COLORS.steel} gradientMap={toonGradient} />
      </mesh>
      <mesh position-z={0.15} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.07, 0.08, 0.03, 24]} />
        <meshToonMaterial color={COLORS.steelDeep} gradientMap={toonGradient} />
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
          <Handle x={0.22} />
          {seams.map((points, i) => (
            <InkLine key={i} points={points.map(([x, y]) => [x, y, 0.004])} />
          ))}
          <mesh position={[(SIDE_TRACK.rear + SIDE_TRACK.front) / 2, SIDE_TRACK.y, 0.006]}>
            <boxGeometry args={[SIDE_TRACK.front - SIDE_TRACK.rear, 0.04, 0.012]} />
            <meshBasicMaterial color={COLORS.ink} />
          </mesh>
          <SlidingDoor open={doorOpen} />
        </group>
      </group>

      <Wheel x={WHEEL_ARCH.axle} />
      <Wheel x={-WHEEL_ARCH.axle} />

      <group position={[1.985, 0.8, 0.46]} rotation-y={Math.PI / 2}>
        <Headlight />
      </group>

      <Toon color={COLORS.neon} position={[-1.965, 0.76, 0.665]} outline={0.012}>
        <boxGeometry args={[0.04, 0.3, 0.09]} />
      </Toon>

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
      position-x={BUS_OFFSET_X}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={bodyGeometry} material={bodyMaterial}>
        <Outlines screenspace thickness={0.026} color={COLORS.ink} />
      </mesh>

      <mesh position-y={0.44}>
        <boxGeometry args={[3.7, 0.34, 1.3]} />
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
      {[-WHEEL_ARCH.axle, WHEEL_ARCH.axle].map((x) => (
        <mesh key={x} position={[x, 0.62, 0]}>
          <boxGeometry args={[2 * WHEEL_ARCH.radius + 0.06, 0.4, 1.5]} />
          <meshBasicMaterial color={COLORS.ink} />
        </mesh>
      ))}

      {[0, Math.PI].map((angle) => (
        <group key={angle} rotation-y={angle}>
          <Toon
            geometry={bumperGeometry}
            color={COLORS.inkSoft}
            position={[1.97, 0.32, 0]}
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

      <InkLine segments points={rackFrame} lineWidth={2.6} />
      <InkLine segments points={rackSlats} lineWidth={1.3} />
      {rackFeet.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, RACK_Y - 0.205, z]}>
          <boxGeometry args={[0.13, 0.03, 0.06]} />
          <meshBasicMaterial color={COLORS.ink} />
        </mesh>
      ))}
      <RoofSign />
      <Hatch open={doorOpen} />
      <HeadlightPool />
    </group>
  );
}
