"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useInView, useReducedMotion } from "motion/react";
import { COLORS } from "./busArt";
import { Toon } from "./Toon";
import { WebGLBoundary } from "./WebGLBoundary";
import { Confetti } from "./spin/Confetti";
import { Dancer, type DancerLook } from "./spin/Dancer";
import { SpinArm } from "./spin/SpinArm";
import { DECK_Y, SpinStage } from "./spin/SpinStage";
import { beatPulse, slowMotion, stageTime, useSpinFrame } from "./spin/timeline";

const CAMERA = new THREE.Vector3(3.9, 2.45, 5.4);
const LOOK_Y = 1.2;
const STAGE_X = -0.26;
const FACE_CAMERA = 0.62;
const GUEST_SCALE = 1.45;
const SLOW_MOTION_PUSH = 0.07;
const SWAY_X = 0.22;
const SWAY_Y = 0.1;
const POP = 0.022;

const GUEST: DancerLook = {
  top: COLORS.neon,
  trousers: COLORS.ink,
  shoe: COLORS.paper,
  shades: false,
  hair: (
    <>
      <Toon color={COLORS.ink} position={[0, 0.06, -0.03]} scale={[1.1, 1, 1.05]} outline={0.01}>
        <sphereGeometry args={[0.2, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </Toon>
      <Toon color={COLORS.ink} position={[0, 0.27, -0.04]} outline={0.01}>
        <sphereGeometry args={[0.085, 14, 10]} />
      </Toon>
    </>
  ),
};

function Show() {
  const stage = useRef<THREE.Group>(null);

  useSpinFrame((time, camera) => {
    const music = stageTime(time);
    const push = 1 - slowMotion(time) * SLOW_MOTION_PUSH;
    camera.position.copy(CAMERA).multiplyScalar(push);
    camera.position.x += Math.sin(music * 0.8) * SWAY_X;
    camera.position.y += Math.sin(music * 0.55) * SWAY_Y;
    camera.lookAt(0, LOOK_Y, 0);
    stage.current!.scale.setScalar(1 + beatPulse(music) * POP);
  });

  return (
    <group ref={stage} position-x={STAGE_X}>
      <SpinStage />
      <group position-y={DECK_Y}>
        <Dancer look={GUEST} rotation-y={FACE_CAMERA} scale={GUEST_SCALE} />
      </group>
      <SpinArm />
      <Confetti />
    </group>
  );
}

export default function SpinModel() {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const reducedMotion = useReducedMotion();
  const animated = inView ? "always" : "never";

  return (
    <div ref={root} className="h-full w-full">
      <WebGLBoundary fallback={null}>
        <Canvas
          flat
          dpr={[1, 2]}
          frameloop={reducedMotion ? "demand" : animated}
          camera={{ position: [CAMERA.x, CAMERA.y, CAMERA.z], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={2} color="#ffedd5" />
          <directionalLight position={[3, 7, 6]} intensity={1} />
          <Show />
        </Canvas>
      </WebGLBoundary>
    </div>
  );
}
