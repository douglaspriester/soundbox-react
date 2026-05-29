import type { CanvasSize } from './types';
import type { CabinetType } from '../types';
import { TOKENS } from '../theme/tokens';
import { rrect } from './primitives/roundRect';

export interface Cabinet2DParams {
  w: number; // external meters
  h: number;
  d: number;
  type: CabinetType;
}

/** Front elevation + side section, side by side, to scale. */
export function drawCabinet2D(ctx: CanvasRenderingContext2D, size: CanvasSize, p: Cabinet2DParams): void {
  const padT = 14, padB = 18, gap = 24, padL = 12, padR = 12;
  const availW = size.width - padL - padR - gap;
  const availH = size.height - padT - padB;
  // scale so the taller of (front uses w×h, side uses d×h) fits
  const scale = Math.min(availH / p.h, availW / (p.w + p.d));
  const fw = p.w * scale, fh = p.h * scale, sw = p.d * scale;
  const baseY = padT + (availH - fh) / 2;
  const frontX = padL;
  const sideX = frontX + fw + gap;

  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';

  // front view
  ctx.strokeStyle = TOKENS.gold;
  ctx.lineWidth = 1.4;
  rrect(ctx, frontX, baseY, fw, fh, 4);
  ctx.stroke();
  // woofer
  const wcx = frontX + fw / 2, wcy = baseY + fh * 0.66;
  const wr = Math.min(fw, fh) * 0.26;
  ctx.beginPath(); ctx.arc(wcx, wcy, wr, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(wcx, wcy, wr * 0.4, 0, Math.PI * 2); ctx.stroke();
  // HF
  const hcy = baseY + fh * 0.2;
  ctx.beginPath(); ctx.arc(wcx, hcy, wr * 0.42, 0, Math.PI * 2); ctx.stroke();
  if (p.type === 'br') {
    ctx.strokeStyle = TOKENS.infoStroke;
    ctx.beginPath(); ctx.arc(frontX + fw * 0.78, baseY + fh * 0.9, wr * 0.28, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = TOKENS.text4;
  ctx.fillText('frente', frontX + fw / 2, baseY + fh + 13);
  ctx.fillText(`${(p.w * 100).toFixed(0)}cm`, frontX + fw / 2, baseY - 4);

  // side section with rockwool hatching
  ctx.strokeStyle = TOKENS.gold;
  rrect(ctx, sideX, baseY, sw, fh, 4);
  ctx.stroke();
  ctx.strokeStyle = TOKENS.grid;
  ctx.lineWidth = 1;
  for (let yy = baseY + 4; yy < baseY + fh - 4; yy += 6) {
    ctx.beginPath(); ctx.moveTo(sideX + 2, yy); ctx.lineTo(sideX + sw - 2, yy + 4); ctx.stroke();
  }
  // driver depth hint
  ctx.fillStyle = TOKENS.goldDim;
  ctx.fillRect(sideX, baseY + fh * 0.55, sw * 0.4, fh * 0.22);
  ctx.fillStyle = TOKENS.text4;
  ctx.fillText('corte lateral', sideX + sw / 2, baseY + fh + 13);
  ctx.fillText(`${(p.d * 100).toFixed(0)}cm`, sideX + sw / 2, baseY - 4);
}
