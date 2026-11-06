import * as THREE from "three";

export const COLORS = {
  ink: "#0a0a0a",
  inkSoft: "#262626",
  paper: "#ffffff",
  paperSoft: "#fafafa",
  primary: "#facc15",
  primarySoft: "#fef9c3",
  mustard: "#f2b61e",
  cabinPaint: "#fae100",
  cabinPaintDeep: "#e3c800",
  steel: "#d4d4d8",
  steelDeep: "#71717a",
  floor: "#d6d6d3",
  neon: "#ff1a1a",
  neonOff: "#fecaca",
  neonAccent: "#f59e0b",
  fabric: "#8a1a42",
  fabricBloom: "#d6456f",
  fabricLeaf: "#f6d9c2",
  mirror: "#0d1412",
  mirrorGlint: "#dfe7e4",
};

export const WHEEL_ARCH = { axle: 1.08, y: 0.38, radius: 0.4 };
/** L-shaped sliding door opening; the notch clears the rear wheel arch. */
export const DOOR = { rear: -1.12, notch: -0.64, front: 0.06, notchTop: 1, bottom: 0.46, top: 1.84 };
/** Trapezoid cut through the tail; half width narrows from `base` by `taper` per unit of height. */
export const TAIL = { bottom: 0.54, top: 1.8, base: 0.6, taper: 0.08 };
/** Dark band across the nose, running from here up to the paint split. */
const NOSE_BAND = { front: 1.7, bottom: 0.6, halfWidth: 0.64 };

/** Written by the sliding doors each frame; 0 keeps the body solid. */
export const doorCut = { value: 0 };

/** Height of the line where the yellow lower body meets the white upper body. */
const PAINT_SPLIT_GLSL = "1.06 - 0.02 * vPaint.x";

export const toonGradient = new THREE.DataTexture(
  new Uint8Array([165, 255]),
  2,
  1,
  THREE.RedFormat,
);
toonGradient.minFilter = THREE.NearestFilter;
toonGradient.magFilter = THREE.NearestFilter;
toonGradient.needsUpdate = true;

const CUTOUTS_GLSL = `
  bool inDoor = abs(vPaint.z) > 0.3 && vPaint.x > ${DOOR.rear.toFixed(2)} && vPaint.x < ${DOOR.front.toFixed(2)}
    && vPaint.y > ${DOOR.bottom.toFixed(2)} && vPaint.y < ${DOOR.top.toFixed(2)}
    && (vPaint.x > ${DOOR.notch.toFixed(2)} || vPaint.y > ${DOOR.notchTop.toFixed(2)});
  bool inTail = vPaint.x < -1.7 && vPaint.y > ${TAIL.bottom.toFixed(2)} && vPaint.y < ${TAIL.top.toFixed(2)}
    && abs(vPaint.z) < ${TAIL.base.toFixed(3)} - ${TAIL.taper.toFixed(3)} * (vPaint.y - ${TAIL.bottom.toFixed(2)});
  if (inTail || (inDoor && doorCut > 0.0)) discard;`;

/** `cutouts` punches the door and tail openings; panels riding on the body leave it off. */
export function createBodyMaterial(cutouts: boolean) {
  const material = new THREE.MeshToonMaterial({ gradientMap: toonGradient });
  const lower = new THREE.Color(COLORS.mustard);
  const upper = new THREE.Color(COLORS.paper);
  const archLining = new THREE.Color(COLORS.ink);

  material.onBeforeCompile = (shader) => {
    shader.uniforms.lowerPaint = { value: lower };
    shader.uniforms.upperPaint = { value: upper };
    shader.uniforms.archLining = { value: archLining };
    shader.uniforms.doorCut = doorCut;
    shader.vertexShader = `varying vec3 vPaint;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvPaint = position;",
    );
    shader.fragmentShader =
      `varying vec3 vPaint;\nuniform float doorCut;\nuniform vec3 lowerPaint;\nuniform vec3 upperPaint;\nuniform vec3 archLining;\n${shader.fragmentShader}`.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        ${cutouts ? CUTOUTS_GLSL : ""}
        float paintEdge = vPaint.y - (${PAINT_SPLIT_GLSL});
        float paintBlur = fwidth(paintEdge);
        diffuseColor.rgb = mix(lowerPaint, upperPaint, smoothstep(-paintBlur, paintBlur, paintEdge));
        bool inNoseBand = vPaint.x > ${NOSE_BAND.front.toFixed(2)} && abs(vPaint.z) < ${NOSE_BAND.halfWidth.toFixed(2)}
          && vPaint.y > ${NOSE_BAND.bottom.toFixed(2)} && paintEdge < 0.0;
        if (inNoseBand) diffuseColor.rgb = archLining;
        float archEdge = length(vec2(abs(vPaint.x) - ${WHEEL_ARCH.axle.toFixed(2)}, vPaint.y - ${WHEEL_ARCH.y.toFixed(2)})) - ${WHEEL_ARCH.radius.toFixed(2)};
        diffuseColor.rgb = mix(archLining, diffuseColor.rgb, step(0.0, archEdge));`,
      );
  };
  material.customProgramCacheKey = () => `body-${cutouts}`;
  return material;
}

export function canvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Tiles once per world unit, so pane UVs (world xy) line up across every window. */
export function tiledTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const texture = canvasTexture(size, size, draw);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createGlassTexture() {
  const size = 256;
  return tiledTexture(size, (ctx) => {
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = COLORS.inkSoft;
    ctx.beginPath();
    for (const [start, width] of [
      [40, 46],
      [106, 14],
    ]) {
      ctx.moveTo(start, size);
      ctx.lineTo(start + width, size);
      ctx.lineTo(start + width + size, 0);
      ctx.lineTo(start + size, 0);
      ctx.closePath();
    }
    ctx.fill();
  });
}

const LETTER_HEIGHT = 340;
const TUBE_WIDTH = 12;
const SIGN_LETTERS = [
  { path: "M0 100V0H42a28 28 0 0 1 0 56H0", width: 70 },
  { path: "M0 0V100M70 0V100M0 50H70", width: 70 },
  { path: "M35 0a35 35 0 0 1 35 35v30a35 35 0 0 1-70 0V35A35 35 0 0 1 35 0z", width: 70 },
  { path: "M0 0H76M38 0V100", width: 76 },
  { path: "M35 0a35 35 0 0 1 35 35v30a35 35 0 0 1-70 0V35A35 35 0 0 1 35 0z", width: 70 },
  { path: "M70 20C60-8 4-8 3 26C2 58 72 44 72 76C72 108 8 108 0 78", width: 72 },
];
const SIGN_CAMERA =
  "M12 24H28l9-20H63l9 20H88a12 12 0 0 1 12 12V88a12 12 0 0 1-12 12H12a12 12 0 0 1-12-12V36a12 12 0 0 1 12-12zM50 38a24 24 0 1 0 0 48a24 24 0 1 0 0-48zM50 54a8 8 0 1 0 0 16a8 8 0 1 0 0-16z";
const FLICKER_LETTER = 3;
const LETTER_GAP = 24;
const CAMERA_WIDTH = 100;
const SIGN_CANVAS = { width: 2560, height: 800 };
/** World size of the sign layers; matches the canvas aspect so tubes are not stretched. */
export const SIGN_PLANE = { width: 3.3, height: (3.3 * SIGN_CANVAS.height) / SIGN_CANVAS.width };

function drawTube(ctx: CanvasRenderingContext2D, path: Path2D, color: string) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  for (const [width, blur, stroke] of [
    [TUBE_WIDTH, 130, color],
    [TUBE_WIDTH, 130, color],
    [TUBE_WIDTH, 60, color],
    [TUBE_WIDTH, 24, color],
    [TUBE_WIDTH * 0.34, 8, COLORS.paper],
  ] as const) {
    ctx.lineWidth = width;
    ctx.shadowBlur = blur;
    ctx.strokeStyle = stroke;
    ctx.stroke(path);
  }
}

/** Runs `draw` once per letter, in sign space where letters are 100 units tall. */
function forEachLetter(
  ctx: CanvasRenderingContext2D,
  draw: (path: Path2D, index: number) => void,
) {
  const unit = LETTER_HEIGHT / 100;
  const wordWidth =
    SIGN_LETTERS.reduce((sum, letter) => sum + letter.width, 0) +
    LETTER_GAP * SIGN_LETTERS.length;
  ctx.setTransform(
    unit,
    0,
    0,
    unit,
    (SIGN_CANVAS.width - (wordWidth + CAMERA_WIDTH) * unit) / 2,
    (SIGN_CANVAS.height - LETTER_HEIGHT) / 2,
  );
  ctx.translate(CAMERA_WIDTH + LETTER_GAP, 0);
  SIGN_LETTERS.forEach((letter, index) => {
    draw(new Path2D(letter.path), index);
    ctx.translate(letter.width + LETTER_GAP, 0);
  });
}

function neonMaterial(draw: (ctx: CanvasRenderingContext2D) => void) {
  const map = canvasTexture(SIGN_CANVAS.width, SIGN_CANVAS.height, draw);
  return new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false });
}

/** Free-standing tubes on transparent layers; `flicker` holds the one letter that buzzes. */
export function createNeonMaterials() {
  const steady = neonMaterial((ctx) => {
    forEachLetter(ctx, (path, index) => {
      if (index === 0) {
        ctx.save();
        ctx.translate(-(CAMERA_WIDTH + LETTER_GAP), 0);
        drawTube(ctx, new Path2D(SIGN_CAMERA), COLORS.neonAccent);
        ctx.restore();
      }
      if (index === FLICKER_LETTER) {
        ctx.shadowBlur = 0;
        ctx.lineWidth = TUBE_WIDTH * 0.6;
        ctx.strokeStyle = COLORS.neonOff;
        ctx.stroke(path);
      } else {
        drawTube(ctx, path, COLORS.neon);
      }
    });
  });
  const flicker = neonMaterial((ctx) => {
    forEachLetter(ctx, (path, index) => {
      if (index === FLICKER_LETTER) drawTube(ctx, path, COLORS.neon);
    });
  });
  return { steady, flicker };
}

export function createGlowTexture(rays: number, hotCore: boolean) {
  const size = 512;
  const center = size / 2;
  return canvasTexture(size, size, (ctx) => {
    ctx.translate(center, center);
    ctx.fillStyle = COLORS.primary;
    for (let i = 0; i < rays; i++) {
      const length = center * (i % 2 ? 0.62 : 0.98);
      ctx.save();
      ctx.rotate((i / rays) * Math.PI * 2);
      const fade = ctx.createLinearGradient(0, 0, length, 0);
      fade.addColorStop(0, "rgba(250, 204, 21, 0.95)");
      fade.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = fade;
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.lineTo(length, 0);
      ctx.lineTo(0, 11);
      ctx.fill();
      ctx.restore();
    }
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, center);
    glow.addColorStop(0, hotCore ? "rgba(255, 255, 255, 1)" : "rgba(250, 204, 21, 0.5)");
    glow.addColorStop(0.12, `rgba(250, 204, 21, ${hotCore ? 0.9 : 0.5})`);
    glow.addColorStop(0.4, "rgba(250, 204, 21, 0.4)");
    glow.addColorStop(1, "rgba(250, 204, 21, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-center, -center, size, size);
  });
}
