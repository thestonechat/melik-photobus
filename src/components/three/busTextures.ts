import { canvasTexture, COLORS, tiledTexture } from "./busArt";

const MARBLE_TILE = 64;
const MARBLE_COLUMNS = 5;
const MARBLE_ROWS = 8;
const CEILING_RIBS = 14;

function drawPomegranate(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = COLORS.fabricBloom;
  ctx.strokeStyle = COLORS.fabricLeaf;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 26);
  ctx.lineTo(x - 11, y - 38);
  ctx.lineTo(x, y - 31);
  ctx.lineTo(x + 11, y - 38);
  ctx.lineTo(x + 9, y - 26);
  ctx.stroke();
  ctx.fillStyle = COLORS.fabricLeaf;
  for (let seed = 0; seed < 6; seed++) {
    const angle = (seed / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * 13, y + Math.sin(angle) * 13, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 7, 19, tilt, 0, Math.PI * 2);
  ctx.fill();
}

/** Burgundy upholstery with pomegranates and pale leaves, after the fabric lining the real bus. */
export function createFabricTexture() {
  const size = 512;
  const cell = size / 4;
  return tiledTexture(size, (ctx) => {
    ctx.fillStyle = COLORS.fabric;
    ctx.fillRect(0, 0, size, size);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col <= 4; col++) {
        const x = (col + (row % 2) / 2) * cell;
        const y = (row + 0.5) * cell;
        drawPomegranate(ctx, x, y);
        drawLeaf(ctx, x + 50, y - 34, 0.8, COLORS.fabricLeaf);
        drawLeaf(ctx, x + 50, y + 32, -0.8, COLORS.primary);
      }
    }
  });
}

/** Near black glass, reading as a mirror through pale glints along its edges. */
export function createMirrorTexture() {
  const [width, height] = [512, 420];
  return canvasTexture(width, height, (ctx) => {
    ctx.fillStyle = COLORS.mirror;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = COLORS.mirrorGlint;
    ctx.lineCap = "round";
    for (const [lineWidth, fromX, fromY, toX, toY] of [
      [5, 8, 400, 8, 120],
      [3, 16, 410, 190, 410],
      [3, 504, 20, 504, 150],
      [2, 330, 8, 480, 8],
    ]) {
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(223, 231, 228, 0.1)";
    ctx.beginPath();
    ctx.moveTo(40, height);
    ctx.lineTo(130, height);
    ctx.lineTo(300, 0);
    ctx.lineTo(210, 0);
    ctx.fill();
  });
}

function drawVein(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x + (seed * 17) % MARBLE_TILE, y);
  ctx.lineTo(x + 18 + (seed * 5) % 30, y + 24);
  ctx.lineTo(x + 8 + (seed * 11) % 44, y + 42);
  ctx.lineTo(x + (seed * 23) % MARBLE_TILE, y + MARBLE_TILE);
  ctx.stroke();
}

/** The checker wall behind the bench, chamfered at the top outer corner where the roof curves. */
export function createMarbleTexture() {
  const [width, height] = [MARBLE_COLUMNS * MARBLE_TILE, MARBLE_ROWS * MARBLE_TILE];
  const chamfer = MARBLE_TILE * 1.1;
  return canvasTexture(width, height, (ctx) => {
    for (let row = 0; row < MARBLE_ROWS; row++) {
      for (let col = 0; col < MARBLE_COLUMNS; col++) {
        const dark = (row + col) % 2 === 0;
        const [x, y] = [col * MARBLE_TILE, row * MARBLE_TILE];
        ctx.fillStyle = dark ? COLORS.ink : COLORS.paper;
        ctx.fillRect(x, y, MARBLE_TILE, MARBLE_TILE);
        drawVein(ctx, x, y, row * 3 + col + 2, dark ? COLORS.steelDeep : COLORS.steel);
      }
    }
    ctx.fillStyle = COLORS.steelDeep;
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width - chamfer, 0);
    ctx.lineTo(width, chamfer);
    ctx.fill();
    ctx.strokeStyle = COLORS.steel;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(width - chamfer, 3);
    ctx.lineTo(width, chamfer);
    ctx.stroke();
  });
}

/** Lengthwise roof ribs. */
export function createCeilingTexture() {
  const size = 64;
  const texture = tiledTexture(size, (ctx) => {
    ctx.fillStyle = COLORS.steel;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = COLORS.steelDeep;
    ctx.fillRect(0, 0, size, size * 0.34);
  });
  texture.repeat.set(1, CEILING_RIBS);
  return texture;
}

export type CabinWallLayout = {
  rear: number;
  front: number;
  floor: number;
  ceiling: number;
  windows: { rear: number; front: number; bottom: number; top: number }[];
};

/** Painted centre wall with the opposite flank's windows and body screws, in world proportions. */
export function createCabinWallTexture({ rear, front, floor, ceiling, windows }: CabinWallLayout) {
  const scale = 420;
  const px = (x: number) => (x - rear) * scale;
  const py = (y: number) => (ceiling - y) * scale;
  return canvasTexture(px(front), py(floor), (ctx) => {
    ctx.fillStyle = COLORS.cabinPaint;
    ctx.fillRect(0, 0, px(front), py(floor));
    ctx.fillStyle = COLORS.cabinPaintDeep;
    ctx.fillRect(0, 0, px(front), 16);
    for (const pane of windows) {
      const [x, y] = [px(pane.rear), py(pane.top)];
      const [width, height] = [(pane.front - pane.rear) * scale, (pane.top - pane.bottom) * scale];
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.roundRect(x - 9, y - 9, width + 18, height + 18, 34);
      ctx.fill();
      ctx.fillStyle = COLORS.inkSoft;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 26);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      for (const offset of [0.3, 0.72]) {
        ctx.beginPath();
        ctx.arc(x + width * offset, py(pane.bottom) + 44, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

/** Black leather bench back: tall padded panels with pale contrast stitching. */
export function createBenchTexture() {
  const [width, height] = [360, 460];
  const panels = 2;
  return canvasTexture(width, height, (ctx) => {
    ctx.fillStyle = COLORS.inkSoft;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 7;
    ctx.strokeRect(0, 0, width, height);
    for (let panel = 0; panel < panels; panel++) {
      const left = (panel / panels) * width;
      const panelWidth = width / panels;
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.roundRect(left + 12, 14, panelWidth - 24, height - 28, 20);
      ctx.stroke();
      ctx.strokeStyle = COLORS.steel;
      ctx.lineWidth = 2;
      ctx.setLineDash([9, 7]);
      ctx.beginPath();
      ctx.moveTo(left + 44, height * 0.28);
      ctx.lineTo(left + panelWidth - 44, height * 0.28);
      ctx.moveTo(left + 44, height * 0.72);
      ctx.lineTo(left + panelWidth - 44, height * 0.72);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}
