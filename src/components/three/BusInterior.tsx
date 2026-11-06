import * as THREE from "three";
import { COLORS } from "./busArt";
import {
  createRoomGeometry,
  DOOR_STEP,
  TAIL_FRAME_X,
  TAIL_RAKE,
  tailFrame,
} from "./busGeometry";
import {
  createBenchTexture,
  createCabinWallTexture,
  createCeilingTexture,
  createFabricTexture,
  createMarbleTexture,
  createMirrorTexture,
} from "./busTextures";
import { Toon } from "./Toon";

const CABIN = { rear: -0.98, front: 0.07, floor: 0.62, ceiling: 1.86 };
const NOOK = { rear: -1.86, front: -1.3, shelf: 1.02, top: 1.84, half: 0.72 };
const BENCH = { depth: 0.36, seatTop: 0.96, backThickness: 0.2, backTop: 1.34, outer: 0.64 };
const NOOK_WIDTH = 2 * NOOK.half;
const NOOK_DEPTH = NOOK.front - NOOK.rear;
const NOOK_HEIGHT = NOOK.top - NOOK.shelf;
const FABRIC_REPEAT = 1.25;

const basic = (color: string) => new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
const mapped = (map: THREE.Texture) => new THREE.MeshBasicMaterial({ map, side: THREE.BackSide });

const fabric = createFabricTexture();
const mirrorTexture = createMirrorTexture();
const benchTexture = createBenchTexture();

/** A world-scaled copy of the fabric, so its motif keeps one size on faces of any shape. */
function fabricFace(width: number, height: number) {
  const texture = fabric.clone();
  texture.repeat.set(width * FABRIC_REPEAT, height * FABRIC_REPEAT);
  texture.needsUpdate = true;
  return texture;
}

const cabinShell = createRoomGeometry(CABIN.rear, CABIN.front, CABIN.floor, CABIN.ceiling);
/** Box-face order: cab side, rear wall, ceiling, floor, door flank, centre wall. */
const cabinMaterials = [
  basic(COLORS.cabinPaint),
  mapped(createMarbleTexture()),
  mapped(createCeilingTexture()),
  basic(COLORS.floor),
  basic(COLORS.cabinPaint),
  mapped(
    createCabinWallTexture({
      ...CABIN,
      windows: [
        { rear: -0.94, front: -0.62, bottom: 1.22, top: 1.76 },
        { rear: -0.5, front: -0.04, bottom: 1.22, top: 1.76 },
      ],
    }),
  ),
];

const nookShell = createRoomGeometry(NOOK.rear, NOOK.front, NOOK.shelf, NOOK.top, -NOOK.half, NOOK.half);
const nookMaterials = [
  mapped(fabricFace(NOOK_WIDTH, NOOK_HEIGHT)),
  mapped(fabricFace(NOOK_WIDTH, NOOK_HEIGHT)),
  mapped(fabricFace(NOOK_DEPTH, NOOK_WIDTH)),
  mapped(fabricFace(NOOK_DEPTH, NOOK_WIDTH)),
  mapped(fabricFace(NOOK_DEPTH, NOOK_HEIGHT)),
  mapped(fabricFace(NOOK_DEPTH, NOOK_HEIGHT)),
];
const shelfFrontTexture = fabricFace(NOOK_WIDTH, NOOK.shelf - 0.46);

function CoffeeMaker() {
  return (
    <group position={[-1.6, NOOK.shelf, 0.42]} rotation-y={-Math.PI / 2}>
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

/** The vanity under the lifted hatch: fabric nook, dark mirror, lit lintel, coffee maker. */
export function RearNook() {
  return (
    <>
      <mesh geometry={nookShell} material={nookMaterials} />
      <group position-x={TAIL_FRAME_X} rotation-z={-TAIL_RAKE}>
        <mesh geometry={tailFrame} rotation-y={-Math.PI / 2}>
          <meshBasicMaterial color={COLORS.cabinPaint} />
        </mesh>
      </group>
      <mesh position={[-1.88, (NOOK.shelf + 0.46) / 2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[NOOK_WIDTH, NOOK.shelf - 0.46]} />
        <meshBasicMaterial map={shelfFrontTexture} color={COLORS.steelDeep} />
      </mesh>
      <group position={[NOOK.front - 0.004, 1.32, -0.12]} rotation-y={-Math.PI / 2}>
        <mesh position-z={-0.001}>
          <planeGeometry args={[0.8, 0.58]} />
          <meshBasicMaterial color={COLORS.steel} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.77, 0.55]} />
          <meshBasicMaterial map={mirrorTexture} />
        </mesh>
      </group>
      <CoffeeMaker />
    </>
  );
}

function Bench() {
  const { depth, seatTop, backThickness, backTop, outer } = BENCH;
  const inner = 0.02;
  const width = outer - inner;
  const middle = (outer + inner) / 2;
  const backX = CABIN.rear + backThickness / 2;
  const backHeight = backTop - CABIN.floor;
  return (
    <>
      <Toon color={COLORS.inkSoft} position={[backX, CABIN.floor + backHeight / 2, middle]}>
        <boxGeometry args={[backThickness, backHeight, width]} />
      </Toon>
      <mesh
        position={[CABIN.rear + backThickness + 0.002, (seatTop + backTop) / 2, middle]}
        rotation-y={Math.PI / 2}
      >
        <planeGeometry args={[width, backTop - seatTop]} />
        <meshBasicMaterial map={benchTexture} />
      </mesh>
      <Toon
        color={COLORS.inkSoft}
        position={[CABIN.rear + depth / 2, (CABIN.floor + seatTop) / 2, middle]}
      >
        <boxGeometry args={[depth, seatTop - CABIN.floor, width]} />
      </Toon>
    </>
  );
}

/** One half of the cabin; the bus renders it per flank, split by a centre wall. */
export function Cabin() {
  return (
    <>
      <mesh geometry={cabinShell} material={cabinMaterials} />
      <Bench />
      <Toon color={COLORS.steel} position={DOOR_STEP.position} outline={0.01}>
        <boxGeometry args={DOOR_STEP.size} />
      </Toon>
    </>
  );
}
