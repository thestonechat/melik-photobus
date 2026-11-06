"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { COLORS } from "../busArt";
import { LOOP, stageTime, TAU, useSpinFrame } from "./timeline";

const BURST_TIMES = [3, 7];
const LIFE = 3.6;
const DRAG = 2.2;
const FLUTTER_FALL = 0.62;
const PIECES = 96;
const STREAMERS = 8;
const STREAMER_LINKS = 16;
const LINK_LAG = 0.022;
const PIECE_COLORS = [COLORS.neon, COLORS.ink, COLORS.paper, COLORS.neonAccent];
const STREAMER_COLORS = [COLORS.neon, COLORS.paper, COLORS.ink];
const CANNONS = [
  { x: -0.72, z: 0.55 },
  { x: 0.7, z: -0.5 },
];

/** Deterministic pseudo random in [0, 1), so every load replays the same show. */
function seeded(n: number) {
  const x = Math.sin(n * 91.17) * 43758.5453;
  return x - Math.floor(x);
}

type Shot = { cannon: number; burst: number; vx: number; vy: number; vz: number; spin: number };

function makeShot(i: number, spread: number): Shot {
  const heading = seeded(i + 1) * TAU;
  const out = spread * (0.4 + seeded(i + 2));
  return {
    cannon: i % CANNONS.length,
    burst: i % 3 === 2 ? 1 : 0,
    vx: Math.cos(heading) * out,
    vy: 3 + seeded(i + 3) * 2.6,
    vz: Math.sin(heading) * out,
    spin: 3 + seeded(i + 4) * 6,
  };
}

const PIECE_SHOTS = Array.from({ length: PIECES }, (_, i) => makeShot(i * 5, 1.5));
const STREAMER_SHOTS = Array.from({ length: STREAMERS }, (_, i) => makeShot(i * 7 + 500, 1));

function ageOf(shot: Shot, stage: number) {
  return (((stage - BURST_TIMES[shot.burst]) % LOOP) + LOOP) % LOOP;
}

function place(target: THREE.Object3D, shot: Shot, age: number) {
  const reach = (1 - Math.exp(-DRAG * age)) / DRAG;
  const { x, z } = CANNONS[shot.cannon];
  target.position.set(
    x + shot.vx * reach + Math.sin(age * shot.spin * 0.5) * 0.08,
    0.3 + shot.vy * reach - FLUTTER_FALL * age,
    z + shot.vz * reach,
  );
}

const dummy = new THREE.Object3D();
const paint = new THREE.Color();

function paintInstances(mesh: THREE.InstancedMesh, colorOf: (i: number) => string) {
  for (let i = 0; i < mesh.count; i++) mesh.setColorAt(i, paint.set(colorOf(i)));
  mesh.frustumCulled = false;
}

const pieceColor = (i: number) => PIECE_COLORS[i % PIECE_COLORS.length];
const linkColor = (i: number) => STREAMER_COLORS[Math.floor(i / STREAMER_LINKS) % STREAMER_COLORS.length];

export function Confetti() {
  const pieces = useRef<THREE.InstancedMesh>(null);
  const links = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    paintInstances(pieces.current!, pieceColor);
    paintInstances(links.current!, linkColor);
  }, []);

  useSpinFrame((time) => {
    const stage = stageTime(time);
    PIECE_SHOTS.forEach((shot, i) => {
      const age = ageOf(shot, stage);
      place(dummy, shot, age);
      dummy.rotation.set(age * shot.spin, age * shot.spin * 0.7, i);
      dummy.scale.setScalar(age < LIFE ? 1 : 0);
      dummy.updateMatrix();
      pieces.current!.setMatrixAt(i, dummy.matrix);
    });
    pieces.current!.instanceMatrix.needsUpdate = true;

    STREAMER_SHOTS.forEach((shot, s) => {
      const age = ageOf(shot, stage);
      for (let link = 0; link < STREAMER_LINKS; link++) {
        const linkAge = Math.max(age - link * LINK_LAG, 0);
        place(dummy, shot, linkAge);
        dummy.position.x += Math.sin(linkAge * 7 + s) * 0.06;
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(age < LIFE ? 1 - (link / STREAMER_LINKS) * 0.5 : 0);
        dummy.updateMatrix();
        links.current!.setMatrixAt(s * STREAMER_LINKS + link, dummy.matrix);
      }
    });
    links.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={pieces} args={[undefined, undefined, PIECES]}>
        <planeGeometry args={[0.1, 0.06]} />
        <meshBasicMaterial side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={links} args={[undefined, undefined, STREAMERS * STREAMER_LINKS]}>
        <sphereGeometry args={[0.028, 6, 4]} />
        <meshBasicMaterial />
      </instancedMesh>
    </>
  );
}
