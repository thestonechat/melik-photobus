import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import {
  COLORS,
  createGlowTexture,
  createNeonMaterials,
  SIGN_PLANE,
} from "./busArt";
import { RACK_Y } from "./busGeometry";

const neon = createNeonMaterials();
const flareTexture = createGlowTexture(14, true);
const poolTexture = createGlowTexture(0, false);

/** Short stutter every few seconds, like a tube with a tired transformer. */
function neonBuzz(time: number) {
  if (time % 6 > 0.8) return 1;
  return Math.sin(time * 53) * Math.sin(time * 31) > 0 ? 1 : 0.12;
}

export function RoofSign() {
  const reducedMotion = useReducedMotion();

  useFrame(({ clock }) => {
    neon.flicker.opacity = reducedMotion ? 1 : neonBuzz(clock.elapsedTime);
  });

  return (
    <group position={[-0.37, RACK_Y + 0.33, 0]}>
      {[0, Math.PI].map((angle) => (
        <group key={angle} rotation-y={angle}>
          {[neon.steady, neon.flicker].map((material, i) => (
            <mesh key={i} material={material} position-z={0.012 + i * 0.001}>
              <planeGeometry args={[SIGN_PLANE.width, SIGN_PLANE.height]} />
            </mesh>
          ))}
        </group>
      ))}
      <Line
        segments
        points={[
          [-1.3, -0.26, 0],
          [1.3, -0.26, 0],
          [-0.85, -0.26, 0],
          [-0.85, -0.33, 0],
          [0.85, -0.26, 0],
          [0.85, -0.33, 0],
        ]}
        color={COLORS.ink}
        lineWidth={2.4}
      />
    </group>
  );
}

/** Lens and flare; sits on the bus nose with local +z pointing forward. */
export function Headlight() {
  return (
    <>
      <mesh>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color={COLORS.paper} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.15, 0.024, 10, 32]} />
        <meshBasicMaterial color={COLORS.steel} />
      </mesh>
      <sprite position-z={0.14} scale={0.7}>
        <spriteMaterial map={flareTexture} transparent depthWrite={false} />
      </sprite>
    </>
  );
}

export function HeadlightPool() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[2.14, 0.012, 0]} scale={[0.52, 0.95, 1]}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={poolTexture} transparent depthWrite={false} opacity={0.75} />
    </mesh>
  );
}
