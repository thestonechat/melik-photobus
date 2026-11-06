"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { COLORS } from "../busArt";
import { Toon } from "../Toon";
import { wedgeRing } from "./geometry";
import { beatPulse, BEAT, slowMotion, stageTime, TAU, useSpinFrame } from "./timeline";

export const DECK_Y = 0.25;
const RIM_RADIUS = 0.79;
const BULB_COUNT = 24;
const CHASE_GROUP = 4;
const CHASE_SPEED = 7;
const SUNBURST = wedgeRing(14, 0, 8);
const DECK_PATTERN = wedgeRing(16, 0.54, 0.7);
const RIPPLES = [0, 1 / 3, 2 / 3];
const RIPPLE_SPAN = 2.2;
const RIPPLE_PERIOD = BEAT * 4;
const BURST_SPEED = 0.05;
const DECK_SPEED = -0.5;

const BULB_LIT = new THREE.Color(COLORS.primary);
const BULB_HOT = new THREE.Color(COLORS.neon);
const BULB_OFF = new THREE.Color(COLORS.inkSoft);
const bulbMatrix = new THREE.Matrix4();

function Bulbs() {
  const bulbs = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    for (let i = 0; i < BULB_COUNT; i++) {
      const angle = (i / BULB_COUNT) * TAU;
      bulbMatrix.setPosition(Math.cos(angle) * RIM_RADIUS, DECK_Y, Math.sin(angle) * RIM_RADIUS);
      bulbs.current!.setMatrixAt(i, bulbMatrix);
    }
    bulbs.current!.instanceMatrix.needsUpdate = true;
  }, []);

  useSpinFrame((time) => {
    const head = Math.floor(stageTime(time) * CHASE_SPEED);
    const allOn = slowMotion(time) > 0.9 && head % 2 === 0;
    for (let i = 0; i < BULB_COUNT; i++) {
      const step = (i + head) % CHASE_GROUP;
      bulbs.current!.setColorAt(i, allOn || step === 0 ? BULB_HOT : step === 2 ? BULB_LIT : BULB_OFF);
    }
    bulbs.current!.instanceColor!.needsUpdate = true;
  });

  return (
    <instancedMesh ref={bulbs} args={[undefined, undefined, BULB_COUNT]}>
      <sphereGeometry args={[0.048, 10, 8]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

function Ripple({ offset }: { offset: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const ink = useRef<THREE.MeshBasicMaterial>(null);

  useSpinFrame((time) => {
    const age = (stageTime(time) / RIPPLE_PERIOD + offset) % 1;
    ring.current!.scale.setScalar(1 + age * RIPPLE_SPAN);
    ink.current!.opacity = 1 - age;
  });

  return (
    <mesh ref={ring} position-y={0.01} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.96, 1, 64]} />
      <meshBasicMaterial ref={ink} color={COLORS.ink} transparent depthWrite={false} />
    </mesh>
  );
}

export function SpinStage() {
  const sunburst = useRef<THREE.Mesh>(null);
  const pattern = useRef<THREE.Mesh>(null);
  const rig = useRef<THREE.Group>(null);

  useSpinFrame((time) => {
    const stage = stageTime(time);
    sunburst.current!.rotation.z = stage * BURST_SPEED;
    pattern.current!.rotation.z = stage * DECK_SPEED;
    rig.current!.scale.y = 1 - beatPulse(stage) * 0.06;
  });

  return (
    <>
      <mesh ref={sunburst} geometry={SUNBURST} position-y={-0.01} rotation-x={-Math.PI / 2}>
        <meshBasicMaterial color={COLORS.primarySoft} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {RIPPLES.map((offset) => (
        <Ripple key={offset} offset={offset} />
      ))}
      <mesh position={[-0.08, 0.005, 0.1]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
      <group ref={rig}>
        <Toon color={COLORS.ink} position-y={0.07} outline={0.012}>
          <cylinderGeometry args={[0.92, 0.98, 0.14, 64]} />
        </Toon>
        <Toon color={COLORS.inkSoft} position-y={0.19} outline={0.012}>
          <cylinderGeometry args={[0.87, 0.9, 0.12, 64]} />
        </Toon>
        <mesh position-y={DECK_Y + 0.002} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.71, 64]} />
          <meshBasicMaterial color={COLORS.paper} />
        </mesh>
        <mesh ref={pattern} geometry={DECK_PATTERN} position-y={DECK_Y + 0.004} rotation-x={-Math.PI / 2}>
          <meshBasicMaterial color={COLORS.neon} />
        </mesh>
        <Bulbs />
      </group>
    </>
  );
}
