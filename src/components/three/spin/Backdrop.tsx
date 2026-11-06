"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { COLORS } from "../busArt";
import { TAU } from "./timeline";

const WALL_RADIUS = 4.2;
const LIGHTS_RADIUS = 3.8;
const SWAGS = 6;
const dummy = new THREE.Object3D();
const paint = new THREE.Color();

type Piece = { x: number; y: number; z: number; color: string; scaleY?: number };

function around(count: number, radius: number, piece: (i: number) => Omit<Piece, "x" | "z">): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * TAU;
    return { ...piece(i), x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
  });
}

/** Height of a string of lights sagging between posts, `at` running 0 to 1 per lap. */
function swag(at: number, top: number, sag: number) {
  const span = (at * SWAGS) % 1;
  return top - sag * 4 * span * (1 - span);
}

const pick = (colors: readonly string[], i: number) => colors[i % colors.length];
const PARTY_COLORS = [COLORS.primary, COLORS.neon, COLORS.paper];

const BULBS = around(60, LIGHTS_RADIUS, (i) => ({ y: swag(i / 60, 3.1, 0.6), color: i % 3 ? COLORS.primary : COLORS.paper }));
const FLAGS = around(48, LIGHTS_RADIUS, (i) => ({ y: swag((i + 4) / 48, 2.5, 0.4) - 0.12, color: pick(PARTY_COLORS, i) }));
const PANELS = around(12, WALL_RADIUS - 0.1, (i) => ({ y: 1.6, color: COLORS.ink, scaleY: i % 2 ? 1 : 0.7 }));
const BALLOONS = around(10, 3.2, (i) => ({ y: 0.9 + (i % 3) * 0.55, color: pick(PARTY_COLORS, i), scaleY: 1.2 }));

function Scatter({ pieces, children }: { pieces: readonly Piece[]; children: ReactNode }) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    pieces.forEach(({ x, y, z, color, scaleY = 1 }, i) => {
      dummy.position.set(x, y, z);
      dummy.lookAt(0, y, 0);
      dummy.scale.set(1, scaleY, 1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      mesh.current!.setColorAt(i, paint.set(color));
    });
    mesh.current!.frustumCulled = false;
  }, [pieces]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, pieces.length]}>
      {children}
      <meshBasicMaterial />
    </instancedMesh>
  );
}

/** The party room around the platform. Only the arm's camera sees it. */
export function Backdrop({ backdropRef }: { backdropRef: RefObject<THREE.Group | null> }) {
  return (
    <group ref={backdropRef} visible={false}>
      <mesh position-y={3}>
        <cylinderGeometry args={[WALL_RADIUS, WALL_RADIUS, 8, 32, 1, true]} />
        <meshBasicMaterial color={COLORS.inkSoft} side={THREE.BackSide} />
      </mesh>
      <mesh position-y={-0.03} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[WALL_RADIUS, 32]} />
        <meshBasicMaterial color={COLORS.primary} />
      </mesh>
      <Scatter pieces={PANELS}>
        <boxGeometry args={[1, 3, 0.05]} />
      </Scatter>
      <Scatter pieces={BULBS}>
        <sphereGeometry args={[0.07, 8, 6]} />
      </Scatter>
      <Scatter pieces={FLAGS}>
        <coneGeometry args={[0.16, 0.34, 3]} />
      </Scatter>
      <Scatter pieces={BALLOONS}>
        <sphereGeometry args={[0.32, 12, 10]} />
      </Scatter>
    </group>
  );
}
