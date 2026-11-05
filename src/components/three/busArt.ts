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
  dome: "#f59e0b",
};

export const WHEEL_ARCH = { axle: 1, y: 0.38, radius: 0.45 };

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

export function createBodyMaterial() {
  const material = new THREE.MeshToonMaterial({ gradientMap: toonGradient });
  const lower = new THREE.Color(COLORS.primary);
  const upper = new THREE.Color(COLORS.paper);
  const archLining = new THREE.Color(COLORS.ink);

  material.onBeforeCompile = (shader) => {
    shader.uniforms.lowerPaint = { value: lower };
    shader.uniforms.upperPaint = { value: upper };
    shader.uniforms.archLining = { value: archLining };
    shader.vertexShader = `varying vec2 vPaint;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvPaint = position.xy;",
    );
    shader.fragmentShader =
      `varying vec2 vPaint;\nuniform vec3 lowerPaint;\nuniform vec3 upperPaint;\nuniform vec3 archLining;\n${shader.fragmentShader}`.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float paintEdge = vPaint.y - (${PAINT_SPLIT_GLSL});
        float paintBlur = fwidth(paintEdge);
        diffuseColor.rgb = mix(lowerPaint, upperPaint, smoothstep(-paintBlur, paintBlur, paintEdge));
        float archEdge = length(vec2(abs(vPaint.x) - ${WHEEL_ARCH.axle.toFixed(2)}, vPaint.y - ${WHEEL_ARCH.y.toFixed(2)})) - ${WHEEL_ARCH.radius.toFixed(2)};
        diffuseColor.rgb = mix(archLining, diffuseColor.rgb, step(0.0, archEdge));`,
      );
  };
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

export function createCurtainTexture() {
  const size = 480;
  const cell = size / 12;
  return tiledTexture(size, (ctx) => {
    ctx.fillStyle = COLORS.primarySoft;
    ctx.fillRect(0, 0, size, size);
    for (let row = 2; row < 7; row++) {
      for (let col = 0; col < 12; col++) {
        ctx.fillStyle = (row + col) % 2 ? COLORS.ink : COLORS.paper;
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
  });
}

export function createGlassTexture() {
  const size = 256;
  return tiledTexture(size, (ctx) => {
    ctx.fillStyle = COLORS.inkSoft;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#737373";
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
const SIGN_DOME = "M-36 100a36 36 0 0 1 72 0zM0 46V30M-34 58-45 47M34 58 45 47";
const FLICKER_LETTER = 3;
const LETTER_GAP = 24;
const DOME_ADVANCE = 62;
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
    (SIGN_CANVAS.width - (wordWidth + DOME_ADVANCE) * unit) / 2,
    (SIGN_CANVAS.height - LETTER_HEIGHT) / 2,
  );
  ctx.translate(DOME_ADVANCE + LETTER_GAP, 0);
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
        ctx.translate(-DOME_ADVANCE, 0);
        drawTube(ctx, new Path2D(SIGN_DOME), COLORS.dome);
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

export function createGlowTexture(rays: number, core = 1) {
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
    glow.addColorStop(0, `rgba(255, 255, 255, ${core})`);
    glow.addColorStop(0.12, `rgba(250, 204, 21, ${0.4 + 0.5 * core})`);
    glow.addColorStop(0.4, "rgba(250, 204, 21, 0.4)");
    glow.addColorStop(1, "rgba(250, 204, 21, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-center, -center, size, size);
  });
}
