import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';

/** Floor pressure heatmap for the fundamental axial modes. Cell-based (dpr-safe). */
export function drawModalMap(ctx: CanvasRenderingContext2D, size: CanvasSize, params: { length: number; width: number }): void {
  const padL = 8, padR = 8, padT = 8, padB = 18;
  const x0 = padL, x1 = size.width - padR, y0 = padT, y1 = size.height - padB;
  const aspect = params.length / Math.max(params.width, 0.5);
  const cols = Math.round(Math.min(72, Math.max(24, 12 * aspect)));
  const rows = 16;
  const cw = (x1 - x0) / cols;
  const ch = (y1 - y0) / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const u = (i + 0.5) / cols; // along length
      const v = (j + 0.5) / rows; // along width
      const press = Math.abs(Math.cos(Math.PI * u)) * 0.7 + Math.abs(Math.cos(Math.PI * v)) * 0.3;
      // red (high) -> blue (low)
      const r = Math.round(60 + press * 180);
      const b = Math.round(200 - press * 170);
      ctx.fillStyle = `rgb(${r},${Math.round(60 + press * 40)},${b})`;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x0 + i * cw, y0 + j * ch, cw + 0.5, ch + 0.5);
    }
  }
  ctx.globalAlpha = 1;

  // sub marker at L/4
  const sx = x0 + 0.25 * (x1 - x0);
  const sy = y0 + 0.5 * (y1 - y0);
  ctx.fillStyle = TOKENS.gold;
  ctx.fillRect(sx - 4, sy - 4, 8, 8);
  ctx.strokeStyle = '#000';
  ctx.strokeRect(sx - 4, sy - 4, 8, 8);

  ctx.fillStyle = TOKENS.text3;
  ctx.font = '9px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('vermelho = pressão alta · azul = nulo · ▦ = sub L/4', x0, size.height - 5);
}
