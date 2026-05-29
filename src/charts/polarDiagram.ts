import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';

/** Waveguide horizontal coverage: nested −0/−3/−6dB wedges of half-angle `cov`. */
export function drawPolarDiagram(ctx: CanvasRenderingContext2D, size: CanvasSize, params: { cov: number }): void {
  const cx = size.width / 2;
  const cy = size.height - 16;
  const radius = Math.min(size.width / 2 - 16, size.height - 30);
  const half = (params.cov / 2) * (Math.PI / 180);
  const up = -Math.PI / 2; // point upward (into the room)

  // reference arcs
  ctx.strokeStyle = TOKENS.grid;
  ctx.lineWidth = 1;
  for (const r of [radius * 0.5, radius]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  const wedge = (frac: number, color: string, alpha: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius * frac, up - half, up + half);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  wedge(1.0, TOKENS.gold, 0.1);
  wedge(0.78, TOKENS.gold, 0.16);
  wedge(0.5, TOKENS.gold, 0.26);

  // center axis
  ctx.strokeStyle = TOKENS.goldDim;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - radius);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = TOKENS.gold;
  ctx.font = '10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${params.cov}° cobertura`, cx, cy + 12);

  // coverage width at ~4m
  const widthAt4 = (2 * 4 * Math.tan(half)).toFixed(1);
  ctx.fillStyle = TOKENS.text3;
  ctx.font = '9px system-ui';
  ctx.fillText(`~${widthAt4}m de largura a 4m`, cx, cy - radius - 4);
}
