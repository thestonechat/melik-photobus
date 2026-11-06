"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { COLORS } from "../busArt";
import { Toon } from "../Toon";
import { starGeometry } from "./geometry";
import { armAngle, flashAmount, useSpinFrame } from "./timeline";

const ARM_RADIUS = 1.28;
const HEAD_Y = 1.08;
const TRAIL_COUNT = 30;
const TRAIL_STEP = 0.013;
const STAR = starGeometry(8, 0.45);
/** The ring rides below her face and tips up at it, keeping her clear on front passes. */
const RING_TILT = -0.35;
const BEAM_LENGTH = 1.05;
const trailDummy = new THREE.Object3D();

export function tipX(angle: number) {
  return Math.cos(angle) * ARM_RADIUS;
}

export function tipZ(angle: number) {
  return -Math.sin(angle) * ARM_RADIUS;
}

/** Stretches with arm speed because each dot replays where the camera just was. */
function Trail() {
  const dots = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    dots.current!.frustumCulled = false;
  }, []);

  useSpinFrame((time) => {
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const angle = armAngle(time - i * TRAIL_STEP);
      trailDummy.position.set(tipX(angle), HEAD_Y, tipZ(angle));
      trailDummy.scale.setScalar(1 - i / TRAIL_COUNT);
      trailDummy.updateMatrix();
      dots.current!.setMatrixAt(i, trailDummy.matrix);
    }
    dots.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={dots} args={[undefined, undefined, TRAIL_COUNT]}>
      <sphereGeometry args={[0.05, 8, 6]} />
      <meshBasicMaterial color={COLORS.neon} />
    </instancedMesh>
  );
}

function FlashPop() {
  const pop = useRef<THREE.Group>(null);

  useSpinFrame((time, camera) => {
    const angle = armAngle(time);
    const flash = flashAmount(angle);
    pop.current!.visible = flash > 0.02;
    pop.current!.position.set(tipX(angle), HEAD_Y, tipZ(angle));
    pop.current!.quaternion.copy(camera.quaternion);
    pop.current!.scale.setScalar(0.18 + flash * 0.24);
  });

  return (
    <group ref={pop}>
      <mesh geometry={STAR} scale={1.22} position-z={-0.02}>
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
      <mesh geometry={STAR}>
        <meshBasicMaterial color={COLORS.paper} />
      </mesh>
    </group>
  );
}

export function SpinArm({ rigRef }: { rigRef: RefObject<THREE.Group | null> }) {
  const arm = useRef<THREE.Group>(null);
  const sweep = useRef<THREE.DirectionalLight>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);

  useSpinFrame((time) => {
    const angle = armAngle(time);
    const flash = flashAmount(angle);
    arm.current!.rotation.y = angle;
    sweep.current!.position.set(tipX(angle), HEAD_Y, tipZ(angle));
    sweep.current!.intensity = 1.1 + flash * 2;
    beam.current!.opacity = 0.1 + flash * 0.45;
  });

  return (
    <>
      <directionalLight ref={sweep} />
      <group ref={rigRef}>
        <group ref={arm}>
          <Toon color={COLORS.ink} position={[0.08, 0.1, 0]} outline={0.01}>
            <boxGeometry args={[2.4, 0.09, 0.14]} />
          </Toon>
          <Toon color={COLORS.inkSoft} position={[-1.12, 0.14, 0]} outline={0.012}>
            <boxGeometry args={[0.2, 0.16, 0.22]} />
          </Toon>
          <Toon color={COLORS.ink} position={[ARM_RADIUS, HEAD_Y / 2, 0]} outline={0.01}>
            <cylinderGeometry args={[0.024, 0.04, HEAD_Y, 12]} />
          </Toon>
          <group position={[ARM_RADIUS - 0.04, HEAD_Y, 0]} rotation={[RING_TILT, -Math.PI / 2, 0, "YXZ"]}>
            <Toon color={COLORS.ink} outline={0.01}>
              <boxGeometry args={[0.13, 0.25, 0.03]} />
            </Toon>
            <mesh position={[0, 0.08, 0.017]}>
              <circleGeometry args={[0.024, 16]} />
              <meshBasicMaterial color={COLORS.neon} />
            </mesh>
            <Toon color={COLORS.paper} outline={0.012}>
              <torusGeometry args={[0.23, 0.03, 10, 40]} />
            </Toon>
            <mesh position-z={BEAM_LENGTH / 2} rotation-x={-Math.PI / 2}>
              <coneGeometry args={[0.2, BEAM_LENGTH, 24, 1, true]} />
              <meshBasicMaterial
                ref={beam}
                color={COLORS.paper}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
        <Trail />
        <FlashPop />
      </group>
    </>
  );
}
