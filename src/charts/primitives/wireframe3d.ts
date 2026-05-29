import type { CanvasSize, Rotation } from '../types';
import { TOKENS } from '../../theme/tokens';

type Vec3 = [number, number, number];

/** Oblique parallel projection (yaw then pitch), as in v4's p3d(). No perspective. */
export function project(x: number, y: number, z: number, rx: number, ry: number): Vec3 {
  const x2 = x * Math.cos(ry) + z * Math.sin(ry);
  const z2 = -x * Math.sin(ry) + z * Math.cos(ry);
  const y2 = y * Math.cos(rx) - z2 * Math.sin(rx);
  const z3 = y * Math.sin(rx) + z2 * Math.cos(rx);
  return [x2, y2, z3];
}

const CORNERS: Vec3[] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // back  (z-)
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],     // front (z+)
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

export interface BoxDims {
  w: number;
  h: number;
  d: number;
}

export interface FaceMapper {
  /** Map face coords u,v ∈ [-0.5,0.5] (of the +z front face) to screen px. */
  at: (u: number, v: number) => [number, number];
}

export interface DrawBoxOpts {
  fit?: number; // fraction of min(size) to occupy (default 0.42)
  color?: string;
  onFront?: (ctx: CanvasRenderingContext2D, face: FaceMapper) => void;
}

/** Depth-shaded wireframe box centered in the canvas, rotated, with an optional front-face callback. */
export function drawWireframeBox(
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
  dims: BoxDims,
  rot: Rotation,
  opts: DrawBoxOpts = {},
): void {
  const maxDim = Math.max(dims.w, dims.h, dims.d) || 1;
  const scale = (Math.min(size.width, size.height) * (opts.fit ?? 0.42)) / maxDim;
  const cx = size.width / 2;
  const cy = size.height / 2;
  const hw = dims.w / 2, hh = dims.h / 2, hd = dims.d / 2;
  const color = opts.color ?? TOKENS.gold;

  const proj = CORNERS.map((c) => project(c[0] * hw, c[1] * hh, c[2] * hd, rot.x, rot.y));
  const screen = proj.map<[number, number]>((p) => [cx + p[0] * scale, cy + p[1] * scale]);

  const zs = proj.map((p) => p[2]);
  const zMin = Math.min(...zs), zMax = Math.max(...zs);
  const zRange = zMax - zMin || 1;

  ctx.lineWidth = 1.1;
  for (const [a, b] of EDGES) {
    const za = (proj[a][2] + proj[b][2]) / 2;
    const t = (za - zMin) / zRange; // 0 = far, 1 = near
    ctx.globalAlpha = 0.28 + 0.72 * t;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(screen[a][0], screen[a][1]);
    ctx.lineTo(screen[b][0], screen[b][1]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if (opts.onFront) {
    const face: FaceMapper = {
      at: (u, v) => {
        const p = project(u * dims.w, v * dims.h, hd, rot.x, rot.y);
        return [cx + p[0] * scale, cy + p[1] * scale];
      },
    };
    opts.onFront(ctx, face);
  }
}
