"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useInView, useReducedMotion } from "motion/react";
import { WebGLBoundary } from "./WebGLBoundary";
import { Backdrop } from "./spin/Backdrop";
import { Confetti } from "./spin/Confetti";
import { Dancer } from "./spin/Dancer";
import { CameraFeed } from "./spin/CameraFeed";
import { SpinArm } from "./spin/SpinArm";
import { DECK_Y, SpinStage } from "./spin/SpinStage";
import { beatPulse, slowMotion, stageTime, useSpinFrame } from "./spin/timeline";

const CAMERA = new THREE.Vector3(3.9, 2.45, 5.4);
const LOOK_Y = 1.2;
const STAGE_X = -0.26;
const FACE_CAMERA = 0.62;
const GUEST_SCALE = 1.6;
const SLOW_MOTION_PUSH = 0.07;
const SWAY_X = 0.22;
const SWAY_Y = 0.1;
const POP = 0.022;

function Show() {
  const stage = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const backdrop = useRef<THREE.Group>(null);

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
        <Dancer rotation-y={FACE_CAMERA} scale={GUEST_SCALE} />
      </group>
      <SpinArm rigRef={rig} />
      <Confetti />
      <Backdrop backdropRef={backdrop} />
      <CameraFeed rigRef={rig} backdropRef={backdrop} stageX={STAGE_X} guestYaw={FACE_CAMERA} />
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
