import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { TAU } from "./timeline";

/** One draw call worth of evenly spaced ring wedges, filling half of the ring. */
export function wedgeRing(count: number, inner: number, outer: number) {
  const step = TAU / count;
  return mergeGeometries(
    Array.from(
      { length: count },
      (_, i) => new THREE.RingGeometry(inner, outer, 3, 1, i * step, step / 2),
    ),
  );
}

export function starGeometry(points: number, inner: number) {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 ? inner : 1;
    const angle = (i * Math.PI) / points;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i) shape.lineTo(x, y);
    else shape.moveTo(x, y);
  }
  return new THREE.ShapeGeometry(shape);
}
