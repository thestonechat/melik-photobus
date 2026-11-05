import * as THREE from "three";

export const COLORS = {
  ink: "#0a0a0a",
  inkSoft: "#262626",
  paper: "#ffffff",
  paperSoft: "#fafafa",
  primary: "#facc15",
  primarySoft: "#fef9c3",
  neon: "#ef4444",
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

export function createSignTexture() {
  const width = 1024;
  const height = 256;
  const family = getComputedStyle(document.body).getPropertyValue("--font-space-grotesk");
  const font = `700 200px ${family || "sans-serif"}`;

  const texture = canvasTexture(width, height, (ctx) => {
    drawSign(ctx, font);
    document.fonts.load(font, "PHOTOS").then(() => {
      drawSign(ctx, font);
      texture.needsUpdate = true;
    });
  });
  return texture;
}

function drawSign(ctx: CanvasRenderingContext2D, font: string) {
  const { width, height } = ctx.canvas;
  ctx.shadowBlur = 0;
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, width, height);

  ctx.shadowColor = COLORS.dome;
  ctx.shadowBlur = 36;
  ctx.fillStyle = COLORS.dome;
  ctx.beginPath();
  ctx.arc(112, 190, 74, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.shadowColor = COLORS.neon;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = COLORS.neon;
  ctx.lineWidth = 14;
  ctx.strokeText("PHOTOS", 212, height / 2 + 10);
  ctx.fillStyle = COLORS.paper;
  ctx.fillText("PHOTOS", 212, height / 2 + 10);
}
