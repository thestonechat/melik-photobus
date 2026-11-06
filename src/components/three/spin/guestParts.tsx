"use client";

import { useLayoutEffect, useRef, type ComponentProps, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { COLORS } from "../busArt";
import { Toon } from "../Toon";
import { heartGeometry, starGeometry } from "./geometry";
import { HIP_X, HIP_Y, LEG, SKIRT_PROFILE, skirtRadius } from "./guestShape";
import { TAU } from "./timeline";

const ARM = 0.17;
const SHOULDER_Y = 0.2;
const SHOULDER_X = 0.125;
const OUTLINE = 0.012;
const SKIRT = new THREE.LatheGeometry(
  SKIRT_PROFILE.map(([radius, y]) => new THREE.Vector2(radius, y)).reverse(),
  36,
);
const DOT_ROWS = [-0.06, -0.115, -0.17];
const DOTS_PER_ROW = 13;
const HEART = heartGeometry();
const SPARK = starGeometry(6, 0.42);
const dotDummy = new THREE.Object3D();
type Joint = RefObject<THREE.Group | null>;

export function ArmRig({
  side,
  shoulderRef,
  elbowRef,
  fingersRef,
  children,
}: {
  side: 1 | -1;
  shoulderRef: Joint;
  elbowRef: Joint;
  fingersRef?: Joint;
  children?: ReactNode;
}) {
  return (
    <group position={[side * SHOULDER_X, SHOULDER_Y, 0]}>
      <Toon color={COLORS.primary} outline={OUTLINE} scale={[1, 0.9, 1]}>
        <sphereGeometry args={[0.078, 14, 12]} />
      </Toon>
      <group ref={shoulderRef} rotation-order="ZXY">
        <Toon color={COLORS.primarySoft} position-y={-ARM / 2} outline={OUTLINE}>
          <capsuleGeometry args={[0.038, ARM, 4, 10]} />
        </Toon>
        <group ref={elbowRef} position-y={-ARM}>
          <Toon color={COLORS.primarySoft} position-y={-ARM / 2} outline={OUTLINE}>
            <capsuleGeometry args={[0.034, ARM, 4, 10]} />
          </Toon>
          <Toon color={COLORS.primarySoft} position-y={-ARM - 0.025} outline={OUTLINE}>
            <sphereGeometry args={[0.052, 12, 10]} />
          </Toon>
          {fingersRef && (
            <group ref={fingersRef} position-y={-ARM - 0.05}>
              {[-0.45, 0.45].map((angle) => (
                <Toon key={angle} color={COLORS.primarySoft} position={[angle * 0.13, -0.07, 0]} rotation-z={angle} outline={0.009}>
                  <capsuleGeometry args={[0.018, 0.11, 3, 8]} />
                </Toon>
              ))}
            </group>
          )}
          {children}
        </group>
      </group>
    </group>
  );
}

export function LegRig({ side, hipRef, kneeRef, ankleRef }: { side: 1 | -1; hipRef: Joint; kneeRef: Joint; ankleRef: Joint }) {
  return (
    <group ref={hipRef} position={[side * HIP_X, HIP_Y, 0]}>
      <Toon color={COLORS.primarySoft} position-y={-LEG / 2} outline={OUTLINE}>
        <capsuleGeometry args={[0.05, LEG, 4, 10]} />
      </Toon>
      <group ref={kneeRef} position-y={-LEG}>
        <Toon color={COLORS.primarySoft} position-y={-LEG / 2} outline={OUTLINE}>
          <capsuleGeometry args={[0.042, LEG, 4, 10]} />
        </Toon>
        <group ref={ankleRef} position-y={-LEG}>
          <Toon color={COLORS.paper} position-y={0.03} outline={OUTLINE}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 12]} />
          </Toon>
          <Toon color={COLORS.neon} position={[0, -0.015, 0.045]} scale={[0.85, 0.62, 1.45]} outline={OUTLINE}>
            <sphereGeometry args={[0.078, 12, 10]} />
          </Toon>
        </group>
      </group>
    </group>
  );
}

/** Closed bell the legs start inside: it moves with the pelvis, so they can't part. */
export function Skirt({ skirtRef }: { skirtRef: Joint }) {
  const dots = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    DOT_ROWS.forEach((y, row) => {
      for (let i = 0; i < DOTS_PER_ROW; i++) {
        const angle = ((i + row / 2) / DOTS_PER_ROW) * TAU;
        const radius = skirtRadius(y);
        dotDummy.position.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
        dotDummy.updateMatrix();
        dots.current!.setMatrixAt(row * DOTS_PER_ROW + i, dotDummy.matrix);
      }
    });
    dots.current!.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group ref={skirtRef}>
      <Toon color={COLORS.primary} geometry={SKIRT} outline={0.016} />
      <instancedMesh ref={dots} args={[undefined, undefined, DOT_ROWS.length * DOTS_PER_ROW]}>
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshBasicMaterial color={COLORS.ink} />
      </instancedMesh>
      <Toon color={COLORS.paper} position-y={-0.215} rotation-x={Math.PI / 2} outline={0.012}>
        <torusGeometry args={[0.335, 0.024, 8, 40]} />
      </Toon>
    </group>
  );
}

function Bow({ scale, ...group }: { scale: number } & ComponentProps<"group">) {
  return (
    <group scale={scale} {...group}>
      {[-1, 1].map((side) => (
        <Toon key={side} color={COLORS.neon} position-x={side * 0.075} rotation-z={side * -Math.PI / 2} outline={0.01}>
          <coneGeometry args={[0.055, 0.14, 12]} />
        </Toon>
      ))}
      <Toon color={COLORS.neon} outline={0.01}>
        <sphereGeometry args={[0.03, 10, 8]} />
      </Toon>
    </group>
  );
}

export function WaistTrim() {
  return (
    <>
      <Toon color={COLORS.neon} position-y={0.01} rotation-x={Math.PI / 2} outline={0.01}>
        <torusGeometry args={[0.122, 0.022, 8, 28]} />
      </Toon>
      <Bow scale={0.75} position={[0, 0.01, 0.14]} />
    </>
  );
}

export function Collar() {
  return (
    <>
      {[-1, 1].map((side) => (
        <Toon key={side} color={COLORS.paper} position={[side * 0.055, 0.29, 0.075]} rotation-z={side * 0.5} scale={[1, 0.6, 0.5]} outline={0.01}>
          <sphereGeometry args={[0.06, 12, 10]} />
        </Toon>
      ))}
    </>
  );
}

function Face() {
  return (
    <group position-z={0.175}>
      {[-0.07, 0.07].map((x) => (
        <group key={x} position={[x, 0.01, 0]}>
          <mesh scale={[1, 1.4, 0.5]}>
            <sphereGeometry args={[0.03, 12, 10]} />
            <meshBasicMaterial color={COLORS.ink} />
          </mesh>
          <mesh position={[0.009, 0.018, 0.016]}>
            <sphereGeometry args={[0.009, 8, 6]} />
            <meshBasicMaterial color={COLORS.paper} />
          </mesh>
          <mesh position={[Math.sign(x) * 0.045, -0.05, -0.022]} rotation-y={Math.sign(x) * 0.5}>
            <circleGeometry args={[0.028, 14]} />
            <meshBasicMaterial color={COLORS.neonOff} />
          </mesh>
        </group>
      ))}
      <mesh position-y={-0.05} rotation-z={Math.PI}>
        <torusGeometry args={[0.04, 0.01, 6, 16, Math.PI]} />
        <meshBasicMaterial color={COLORS.ink} />
      </mesh>
    </group>
  );
}

export function Head({ ponytailRef }: { ponytailRef: Joint }) {
  return (
    <>
      <Toon color={COLORS.primarySoft} outline={OUTLINE}>
        <sphereGeometry args={[0.2, 24, 18]} />
      </Toon>
      <Face />
      <Toon color={COLORS.ink} position={[0, 0.03, -0.015]} rotation-x={-0.6} scale={1.07} outline={0.01}>
        <sphereGeometry args={[0.2, 20, 14, 0, TAU, 0, Math.PI * 0.62]} />
      </Toon>
      {[-0.1, 0, 0.1].map((x) => (
        <Toon key={x} color={COLORS.ink} position={[x, 0.1, 0.165]} scale={[1, 0.65, 0.5]} outline={0.006}>
          <sphereGeometry args={[0.075, 10, 8]} />
        </Toon>
      ))}
      <group ref={ponytailRef} position={[0.13, 0.13, -0.12]}>
        <Bow scale={1.05} position={[0, 0.03, -0.02]} rotation-x={-0.5} />
        <Toon color={COLORS.ink} position={[0, -0.13, -0.07]} scale={[0.85, 1.6, 0.85]} rotation-x={0.3} outline={0.01}>
          <sphereGeometry args={[0.1, 14, 10]} />
        </Toon>
        <Toon color={COLORS.ink} position={[0, -0.32, -0.1]} scale={[0.55, 1, 0.55]} outline={0.008}>
          <coneGeometry args={[0.1, 0.2, 12]} />
        </Toon>
      </group>
    </>
  );
}

export function Sparkler({ sparkRef }: { sparkRef: Joint }) {
  return (
    <group position-y={-ARM - 0.03} rotation-x={Math.PI}>
      <Toon color={COLORS.ink} position-y={0.14} outline={0.006}>
        <cylinderGeometry args={[0.008, 0.008, 0.28, 6]} />
      </Toon>
      <group ref={sparkRef} position-y={0.29}>
        <mesh geometry={SPARK} scale={0.17}>
          <meshBasicMaterial color={COLORS.ink} side={THREE.DoubleSide} />
        </mesh>
        {[-0.01, 0.01].map((z) => (
          <mesh key={z} geometry={SPARK} scale={0.12} position-z={z}>
            <meshBasicMaterial color={COLORS.paper} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function KissHeart({ heartRef }: { heartRef: Joint }) {
  return (
    <group ref={heartRef}>
      <mesh geometry={HEART} scale={1.3} position={[0, -0.012, -0.01]}>
        <meshBasicMaterial color={COLORS.ink} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={HEART}>
        <meshBasicMaterial color={COLORS.neon} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
