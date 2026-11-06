import * as THREE from "three";
import { COLORS, createFabricTexture, createMirrorTexture } from "./busArt";
import { createRoomGeometry, tailFrame } from "./busGeometry";
import { Toon } from "./Toon";

const fabricTexture = createFabricTexture();
const mirrorTexture = createMirrorTexture();

/** Open-sided box seen from within; walls facing the viewer cull away, so openings stay clear. */
function Room({ size, position }: { size: [number, number, number]; position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial map={fabricTexture} side={THREE.BackSide} />
    </mesh>
  );
}

function LightStrip({ position, length, axis }: { position: [number, number, number]; length: number; axis: "x" | "z" }) {
  return (
    <mesh position={position}>
      <boxGeometry args={axis === "x" ? [length, 0.02, 0.03] : [0.03, 0.02, length]} />
      <meshBasicMaterial color={COLORS.primary} />
    </mesh>
  );
}

function CoffeeMaker() {
  return (
    <group position={[-1.56, 0.92, 0.39]} rotation-y={-Math.PI / 2}>
      <Toon color={COLORS.inkSoft} position={[0, 0.02, 0]} outline={0.012}>
        <boxGeometry args={[0.24, 0.04, 0.2]} />
      </Toon>
      <Toon color={COLORS.inkSoft} position={[0, 0.16, -0.07]} outline={0.012}>
        <boxGeometry args={[0.24, 0.26, 0.06]} />
      </Toon>
      <Toon color={COLORS.inkSoft} position={[0, 0.31, -0.01]} outline={0.012}>
        <boxGeometry args={[0.24, 0.07, 0.19]} />
      </Toon>
      <mesh position={[0.08, 0.31, 0.087]}>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial color={COLORS.neon} />
      </mesh>
      <Toon color={COLORS.paper} position={[0, 0.11, 0.02]} outline={0.012}>
        <cylinderGeometry args={[0.06, 0.075, 0.14, 24]} />
      </Toon>
      <mesh position={[0, 0.085, 0.02]}>
        <cylinderGeometry args={[0.072, 0.077, 0.08, 24]} />
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
    </group>
  );
}

/** The vanity under the lifted hatch: fabric nook, wall mirror and a coffee maker on the shelf. */
export function RearNook() {
  return (
    <>
      <Room size={[0.48, 0.84, 1.26]} position={[-1.56, 1.32, 0]} />
      <mesh geometry={tailFrame} position-x={-1.855} rotation-y={-Math.PI / 2}>
        <meshBasicMaterial color={COLORS.primary} />
      </mesh>
      <LightStrip position={[-1.7, 1.69, 0]} length={1.1} axis="z" />
      <group position={[-1.325, 1.31, -0.1]} rotation-y={Math.PI / 2}>
        <mesh position-z={-0.002}>
          <planeGeometry args={[0.8, 0.66]} />
          <meshBasicMaterial color={COLORS.ink} side={THREE.DoubleSide} />
        </mesh>
        <mesh position-z={-0.004}>
          <planeGeometry args={[0.76, 0.62]} />
          <meshBasicMaterial map={mirrorTexture} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <CoffeeMaker />
    </>
  );
}

const cabinShell = createRoomGeometry(-1, 0.04, 0.62, 1.86);

function Shell({ geometry }: { geometry: THREE.BufferGeometry }) {
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={fabricTexture} side={THREE.BackSide} />
    </mesh>
  );
}

/** One half of the cabin; the bus renders it per flank, split by a centre wall. */
export function Cabin() {
  return (
    <>
      <Shell geometry={cabinShell} />
      <LightStrip position={[-0.47, 1.84, 0.34]} length={0.96} axis="x" />
      <Toon color={COLORS.primary} position={[-0.78, 0.76, 0.36]}>
        <boxGeometry args={[0.36, 0.28, 0.62]} />
      </Toon>
      {[-0.42, -0.2, 0.0].map((x, i) => (
        <mesh key={x} position={[x - 0.02, 1.34, 0.03]} rotation-z={(i - 1) * 0.08}>
          <planeGeometry args={[0.15, 0.42]} />
          <meshBasicMaterial color={COLORS.paper} />
        </mesh>
      ))}
    </>
  );
}
