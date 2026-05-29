import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';

export interface ModeLine {
  n: number;
  f: number;
}

const COLORS = [TOKENS.gold, TOKENS.infoStroke, TOKENS.okStroke, TOKENS.warnStroke];

/** Standing-wave shapes for the first axial modes along the room length. */
export function drawModes(ctx: CanvasRenderingContext2D, size: CanvasSize, params: { modes: ModeLine[] }): void {
  const padL = 8, padR = 8, padT = 10, padB = 16;
  const x0 = padL, x1 = size.width - padR;
  const mid = (padT + (size.height - padB)) / 2;
  const amp = (size.height - padT - padB) / 2 - 2;

  // center line
  ctx.strokeStyle = TOKENS.grid;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x0, mid);
  ctx.lineTo(x1, mid);
  ctx.stroke();
  ctx.setLineDash([]);

  const shown = params.modes.slice(0, 4);
  shown.forEach((m, idx) => {
    ctx.strokeStyle = COLORS[idx % COLORS.length];
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let px = x0; px <= x1; px++) {
      const t = (px - x0) / (x1 - x0);
      const y = mid - Math.cos(Math.PI * m.n * t) * amp;
      if (px === x0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();

    ctx.fillStyle = COLORS[idx % COLORS.length];
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${m.f.toFixed(0)}Hz`, x0 + 2 + idx * 46, size.height - 5);
  });
}
