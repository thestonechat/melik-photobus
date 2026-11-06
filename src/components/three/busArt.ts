import * as THREE from "three";

export const COLORS = {
  ink: "#0a0a0a",
  inkSoft: "#262626",
  paper: "#ffffff",
  paperSoft: "#fafafa",
  primary: "#facc15",
  primarySoft: "#fef9c3",
  neon: "#ff1a1a",
  neonOff: "#fecaca",
  neonAccent: "#f59e0b",
  fabric: "#4c1130",
  fabricBloom: "#be2d5b",
  mirror: "#c9ced6",
};

export const WHEEL_ARCH = { axle: 1, y: 0.38, radius: 0.45 };
/** L-shaped sliding door opening; the notch clears the rear wheel arch. */
export const DOOR = { rear: -0.96, notch: -0.47, front: 0.02, notchTop: 1, bottom: 0.46, top: 1.84 };
/** Trapezoid cut through the tail; half width narrows from `base` by `taper` per unit of height. */
export const TAIL = { bottom: 0.92, top: 1.7, base: 0.6, taper: 0.077 };

/** Written by the sliding doors each frame; 0 keeps the body solid. */
export const doorCut = { value: 0 };

/** Height of the line where the yellow lower body meets the white upper body. */
const PAINT_SPLIT_GLSL = "1.1 - 0.04 * vPaint.x";

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
  bool inTail = vPaint.x < -1.6 && vPaint.y > ${TAIL.bottom.toFixed(2)} && vPaint.y < ${TAIL.top.toFixed(2)}
    && abs(vPaint.z) < ${TAIL.base.toFixed(3)} - ${TAIL.taper.toFixed(3)} * (vPaint.y - ${TAIL.bottom.toFixed(2)});
  if (inTail || (inDoor && doorCut > 0.0)) discard;`;

/** `cutouts` punches the door and tail openings; panels riding on the body leave it off. */
export function createBodyMaterial(cutouts: boolean) {
  const material = new THREE.MeshToonMaterial({ gradientMap: toonGradient });
  const lower = new THREE.Color(COLORS.primary);
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
        float archEdge = length(vec2(abs(vPaint.x) - ${WHEEL_ARCH.axle.toFixed(2)}, vPaint.y - ${WHEEL_ARCH.y.toFixed(2)})) - ${WHEEL_ARCH.radius.toFixed(2)};
        diffuseColor.rgb = mix(archLining, diffuseColor.rgb, step(0.0, archEdge));`,
      );
  };
  material.customProgramCacheKey = () => `body-${cutouts}`;
  return material;
}

function canvasTexture(
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
function tiledTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const texture = canvasTexture(size, size, draw);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Burgundy upholstery with pomegranate blooms, after the fabric lining the real bus. */
export function createFabricTexture() {
  const size = 512;
  const texture = tiledTexture(size, (ctx) => {
    ctx.fillStyle = COLORS.fabric;
    ctx.fillRect(0, 0, size, size);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = (col + (row % 2) / 2) * (size / 4);
        const y = (row + 0.5) * (size / 4);
        ctx.fillStyle = COLORS.fabricBloom;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(x + 46, y - 30, 8, 20, 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });
  texture.repeat.set(1.5, 1.5);
  return texture;
}

export function createMirrorTexture() {
  const [width, height] = [512, 420];
  return canvasTexture(width, height, (ctx) => {
    const silver = ctx.createLinearGradient(0, 0, width, height);
    silver.addColorStop(0, COLORS.paper);
    silver.addColorStop(0.45, COLORS.mirror);
    silver.addColorStop(1, "#737373");
    ctx.fillStyle = silver;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    for (const [start, band] of [
      [110, 70],
      [210, 22],
    ]) {
      ctx.beginPath();
      ctx.moveTo(start, height);
      ctx.lineTo(start + band, height);
      ctx.lineTo(start + band + height * 0.6, 0);
      ctx.lineTo(start + height * 0.6, 0);
      ctx.fill();
    }
  });
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
  "M12 24H28l9-20H63l9 20H88a12 12 0 0 1 12 12V88a12 12 0 0 1-12 12H12a12 12 0 0 1-12-12V36a12 12 0 0 1 12-12zM50 42a20 20 0 1 0 0 40a20 20 0 1 0 0-40z";
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
