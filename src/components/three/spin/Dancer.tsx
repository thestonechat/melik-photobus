"use client";

import { useRef, type ComponentProps } from "react";
import * as THREE from "three";
import { COLORS } from "../busArt";
import { Toon } from "../Toon";
import { restPose, samplePose } from "./dancerPoses";
import { ArmRig, Collar, Head, KissHeart, LegRig, Skirt, Sparkler, WaistTrim } from "./guestParts";
import { type LegAngles, HIP_X, HIP_Y, solveLeg } from "./guestShape";
import { BEAT, beatPulse, stageTime, useSpinFrame } from "./timeline";

const FOOT_CLEARANCE = 0.09;
const HEAD_Y = 0.48;
const GROOVE_BEND = 0.1;
const FLARE_WIDTH = 0.2;
const FLARE_DROP = 0.2;
const TOE_POINT = 0.5;
const HEART_SCALE = 0.6;
const emptyLeg = (): LegAngles => ({ thigh: 0, out: 0, knee: 0, footY: 0 });

function applyLeg(hip: THREE.Group, knee: THREE.Group, ankle: THREE.Group, leg: LegAngles, raised: number) {
  hip.rotation.set(-leg.thigh, 0, leg.out);
  knee.rotation.x = leg.knee;
  ankle.rotation.x = leg.thigh - leg.knee + Math.min(raised * 6, 1) * TOE_POINT;
}

/** The guest: the phone's polka-dot party girl, posed pose-to-pose on the beat. */
export function Dancer(group: ComponentProps<"group">) {
  const body = useRef<THREE.Group>(null);
  const pelvis = useRef<THREE.Group>(null);
  const skirt = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const ponytail = useRef<THREE.Group>(null);
  const shoulderL = useRef<THREE.Group>(null);
  const shoulderR = useRef<THREE.Group>(null);
  const elbowL = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const fingers = useRef<THREE.Group>(null);
  const spark = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const ankleL = useRef<THREE.Group>(null);
  const ankleR = useRef<THREE.Group>(null);
  const pose = useRef(restPose());
  const legL = useRef(emptyLeg());
  const legR = useRef(emptyLeg());

  useSpinFrame((time) => {
    const stage = stageTime(time);
    const p = pose.current;
    samplePose(stage, p);
    const bounce = beatPulse(stage) * (p.jump > 0.1 ? 0 : 1);
    const sway = Math.sin((stage * Math.PI) / BEAT / 2);
    const bend = bounce * GROOVE_BEND;

    solveLeg(p.legL0 + bend, p.legL1, p.legL2 + bend * 2, legL.current);
    solveLeg(p.legR0 + bend, p.legR1, p.legR2 + bend * 2, legR.current);
    const reachL = legL.current.footY - Math.sin(p.roll) * HIP_X;
    const reachR = legR.current.footY + Math.sin(p.roll) * HIP_X;
    const stand = Math.max(reachL, reachR);
    applyLeg(hipL.current!, kneeL.current!, ankleL.current!, legL.current, stand - reachL);
    applyLeg(hipR.current!, kneeR.current!, ankleR.current!, legR.current, stand - reachR);

    body.current!.position.y = stand - HIP_Y + FOOT_CLEARANCE + p.jump;
    body.current!.rotation.y = p.spin + sway * 0.1;
    pelvis.current!.rotation.z = p.roll + sway * 0.03;
    skirt.current!.scale.set(1 + p.flare * FLARE_WIDTH, 1 - p.flare * FLARE_DROP, 1 + p.flare * FLARE_WIDTH);

    torso.current!.rotation.set(p.bow + bounce * 0.05, p.turn, p.lean - p.roll * 0.4 - sway * 0.05);
    head.current!.rotation.set(p.nod + bounce * 0.1, -p.turn * 0.5, p.tilt - p.lean * 0.5 + sway * 0.06);
    ponytail.current!.rotation.set(0.25 + p.hair * 0.9 + bounce * 0.18, 0, 0.3 + sway * 0.3 + p.hair * 0.7);

    shoulderL.current!.rotation.set(-p.armL1, p.armL2, -p.armL0 - sway * 0.05);
    shoulderR.current!.rotation.set(-p.armR1, -p.armR2, p.armR0 + sway * 0.05);
    elbowL.current!.rotation.x = -p.armL3;
    elbowR.current!.rotation.x = -p.armR3;
    fingers.current!.scale.setScalar(Math.max(p.peace, 0.001));

    spark.current!.rotation.z = stage * 4;
    spark.current!.scale.setScalar(0.85 + bounce * 0.5);
    const kiss = Math.max(p.kiss, 0);
    heart.current!.visible = kiss > 0.05;
    heart.current!.position.set(-0.34, HEAD_Y + 0.02 + kiss * 0.12, 0.2);
    heart.current!.scale.setScalar(kiss * HEART_SCALE);
  });

  return (
    <group {...group}>
      <group ref={body}>
        <group ref={pelvis}>
          <LegRig side={-1} hipRef={hipL} kneeRef={kneeL} ankleRef={ankleL} />
          <LegRig side={1} hipRef={hipR} kneeRef={kneeR} ankleRef={ankleR} />
          <Skirt skirtRef={skirt} />
          <group ref={torso}>
            <Toon color={COLORS.primary} position-y={0.13} scale={[1, 1, 0.85]} outline={0.014}>
              <capsuleGeometry args={[0.115, 0.1, 6, 14]} />
            </Toon>
            <WaistTrim />
            <Collar />
            <ArmRig side={-1} shoulderRef={shoulderL} elbowRef={elbowL} fingersRef={fingers} />
            <ArmRig side={1} shoulderRef={shoulderR} elbowRef={elbowR}>
              <Sparkler sparkRef={spark} />
            </ArmRig>
            <group ref={head} position-y={HEAD_Y}>
              <Head ponytailRef={ponytail} />
            </group>
          </group>
        </group>
        <KissHeart heartRef={heart} />
      </group>
    </group>
  );
}
