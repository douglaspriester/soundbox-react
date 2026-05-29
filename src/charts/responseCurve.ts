import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';
import { plotArea, drawFreqGrid, drawDbGrid, xLog } from './primitives/axes';
import { responseDb } from '../physics/thieleSmall';

export interface ResponseParams {
  fc: number;
  qtc: number;
  f3: number;
}

export function drawResponseCurve(ctx: CanvasRenderingContext2D, size: CanvasSize, p: ResponseParams): void {
  const plot = plotArea(size);
  drawFreqGrid(ctx, plot);
  const yOf = drawDbGrid(ctx, plot, -24, 6, 6);

  ctx.strokeStyle = TOKENS.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 240; i++) {
    const f = 20 * Math.pow(1000, i / 240);
    const db = Math.max(-24, Math.min(6, responseDb(f, p.fc, p.qtc)));
    const x = xLog(f, plot);
    const y = yOf(db);
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (p.f3 > 0) {
    const x = xLog(p.f3, plot);
    ctx.strokeStyle = TOKENS.goldDim;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, plot.y0);
    ctx.lineTo(x, plot.y1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = TOKENS.gold;
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`F3 ${p.f3.toFixed(0)}Hz`, x + 3, plot.y0 + 10);
  }
}
