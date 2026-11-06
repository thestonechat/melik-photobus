"use client";

import { useRef, type ComponentProps, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { COLORS } from "../busArt";
import { Toon } from "../Toon";
import { restPose, samplePose } from "./dancerPoses";
import { BEAT, beatPulse, stageTime, useSpinFrame } from "./timeline";

const LEG = 0.25;
const ARM = 0.2;
const SHOULDER_Y = 0.3;
const SHOULDER_X = 0.16;
const HIP_X = 0.085;
const FACE_Z = 0.17;
const OUTLINE = 0.012;

type Joint = RefObject<THREE.Group | null>;

function ArmRig({ side, sleeve, shoulderRef, elbowRef }: { side: 1 | -1; sleeve: string; shoulderRef: Joint; elbowRef: Joint }) {
  return (
    <group ref={shoulderRef} position={[side * SHOULDER_X, SHOULDER_Y, 0]}>
      <Toon color={sleeve} position-y={-ARM / 2} outline={OUTLINE}>
        <capsuleGeometry args={[0.05, ARM, 4, 10]} />
      </Toon>
      <group ref={elbowRef} position-y={-ARM}>
        <Toon color={COLORS.primarySoft} position-y={-ARM / 2} outline={OUTLINE}>
          <capsuleGeometry args={[0.045, ARM, 4, 10]} />
        </Toon>
        <Toon color={COLORS.primarySoft} position-y={-ARM - 0.03} outline={OUTLINE}>
          <sphereGeometry args={[0.07, 12, 10]} />
        </Toon>
      </group>
    </group>
  );
}

function LegRig({
  side,
  look,
  hipRef,
  kneeRef,
  ankleRef,
}: {
  side: 1 | -1;
  look: DancerLook;
  hipRef: Joint;
  kneeRef: Joint;
  ankleRef: Joint;
}) {
  return (
    <group ref={hipRef} position-x={side * HIP_X}>
      <Toon color={look.trousers} position-y={-LEG / 2} outline={OUTLINE}>
        <capsuleGeometry args={[0.065, LEG, 4, 10]} />
      </Toon>
      <group ref={kneeRef} position-y={-LEG}>
        <Toon color={look.trousers} position-y={-LEG / 2} outline={OUTLINE}>
          <capsuleGeometry args={[0.055, LEG, 4, 10]} />
        </Toon>
        <group ref={ankleRef} position-y={-LEG}>
          <Toon color={look.shoe} position={[0, -0.01, 0.05]} scale={[1, 0.7, 1.7]} outline={OUTLINE}>
            <sphereGeometry args={[0.08, 12, 10]} />
          </Toon>
        </group>
      </group>
    </group>
  );
}

function bendLeg(hip: THREE.Group, knee: THREE.Group, ankle: THREE.Group, crouch: number, lift: number, splay: number) {
  const thigh = crouch + lift * 1.1;
  const bend = 2 * crouch + lift * 1.6;
  hip.rotation.set(-thigh, 0, splay);
  knee.rotation.x = bend;
  ankle.rotation.x = thigh - bend;
}

function Face({ shades }: { shades: boolean }) {
  return (
    <group position-z={FACE_Z}>
      {shades ? (
        <mesh position-y={0.03}>
          <boxGeometry args={[0.26, 0.075, 0.03]} />
          <meshBasicMaterial color={COLORS.ink} />
        </mesh>
      ) : (
        [-0.07, 0.07].map((x) => (
          <mesh key={x} position={[x, 0.03, 0]} scale-y={1.4}>
            <sphereGeometry args={[0.024, 10, 8]} />
            <meshBasicMaterial color={COLORS.ink} />
          </mesh>
        ))
      )}
      {[-0.115, 0.115].map((x) => (
        <mesh key={x} position={[x, -0.035, -0.03]}>
          <circleGeometry args={[0.032, 14]} />
          <meshBasicMaterial color={COLORS.neonOff} />
        </mesh>
      ))}
      <mesh position={[0, -0.04, 0]} rotation-z={Math.PI}>
        <torusGeometry args={[0.055, 0.012, 6, 16, Math.PI]} />
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
    </group>
  );
}

export type DancerLook = {
  top: string;
  trousers: string;
  shoe: string;
  shades: boolean;
  hair: ReactNode;
};

/** A chibi figure posed pose-to-pose on the beat. */
export function Dancer({ look, ...group }: { look: DancerLook } & ComponentProps<"group">) {
  const body = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const shoulderL = useRef<THREE.Group>(null);
  const shoulderR = useRef<THREE.Group>(null);
  const elbowL = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const ankleL = useRef<THREE.Group>(null);
  const ankleR = useRef<THREE.Group>(null);
  const pose = useRef(restPose());

  useSpinFrame((time) => {
    const stage = stageTime(time);
    const p = pose.current;
    samplePose(stage, p);
    const bounce = beatPulse(stage);
    const sway = Math.sin((stage * Math.PI) / BEAT / 2);
    const crouch = p.crouch + bounce * 0.12;

    shoulderL.current!.rotation.set(-p.swingL, 0, -p.reachL);
    shoulderR.current!.rotation.set(-p.swingR, 0, p.reachR);
    elbowL.current!.rotation.x = -p.elbowL;
    elbowR.current!.rotation.x = -p.elbowR;
    bendLeg(hipL.current!, kneeL.current!, ankleL.current!, crouch, p.liftL, -p.splay);
    bendLeg(hipR.current!, kneeR.current!, ankleR.current!, crouch, p.liftR, p.splay);

    body.current!.position.y = 2 * LEG * Math.cos(crouch) * Math.cos(p.splay) + 0.08 + p.jump;
    body.current!.position.x = sway * 0.035;
    torso.current!.rotation.set(0.08 + crouch * 0.3, p.twist, p.lean + sway * 0.05);
    head.current!.rotation.set(-0.1 + bounce * 0.2, -p.twist * 0.6, -p.lean + sway * 0.1);
  });

  return (
    <group {...group}>
      <group ref={body}>
        <LegRig side={-1} look={look} hipRef={hipL} kneeRef={kneeL} ankleRef={ankleL} />
        <LegRig side={1} look={look} hipRef={hipR} kneeRef={kneeR} ankleRef={ankleR} />
        <group ref={torso}>
          <Toon color={look.top} position-y={0.16} scale={[1, 1, 0.8]} outline={OUTLINE}>
            <capsuleGeometry args={[0.15, 0.2, 6, 14]} />
          </Toon>
          <Toon color={look.top} outline={OUTLINE}>
            <coneGeometry args={[0.215, 0.22, 24]} />
          </Toon>
          <ArmRig side={-1} sleeve={look.top} shoulderRef={shoulderL} elbowRef={elbowL} />
          <ArmRig side={1} sleeve={look.top} shoulderRef={shoulderR} elbowRef={elbowR} />
          <group ref={head} position-y={0.56}>
            <Toon color={COLORS.primarySoft} outline={OUTLINE}>
              <sphereGeometry args={[0.2, 24, 18]} />
            </Toon>
            <Face shades={look.shades} />
            {look.hair}
          </group>
        </group>
      </group>
    </group>
  );
}
