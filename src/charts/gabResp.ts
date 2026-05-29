import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';
import { plotArea, drawFreqGrid, drawDbGrid, xLog } from './primitives/axes';
import { responseDb } from '../physics/thieleSmall';

export interface GabRespParams {
  fcIdeal: number;
  qtcIdeal: number;
  fcCurrent: number;
  qtcCurrent: number;
}

function curve(ctx: CanvasRenderingContext2D, plot: ReturnType<typeof plotArea>, yOf: (db: number) => number, fc: number, qtc: number) {
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 240; i++) {
    const f = 20 * Math.pow(1000, i / 240);
    const db = Math.max(-24, Math.min(6, responseDb(f, fc, qtc)));
    const x = xLog(f, plot);
    const y = yOf(db);
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function drawGabResp(ctx: CanvasRenderingContext2D, size: CanvasSize, p: GabRespParams): void {
  const plot = plotArea(size);
  drawFreqGrid(ctx, plot);
  const yOf = drawDbGrid(ctx, plot, -24, 6, 6);

  ctx.strokeStyle = TOKENS.text3;
  ctx.lineWidth = 1.3;
  ctx.setLineDash([5, 4]);
  curve(ctx, plot, yOf, p.fcIdeal, p.qtcIdeal);
  ctx.setLineDash([]);

  ctx.strokeStyle = TOKENS.gold;
  ctx.lineWidth = 2;
  curve(ctx, plot, yOf, p.fcCurrent, p.qtcCurrent);

  ctx.font = '9px system-ui';
  ctx.textAlign = 'left';
  ctx.fillStyle = TOKENS.text3;
  ctx.fillText('— — volume sugerido', plot.x0 + 4, plot.y0 + 10);
  ctx.fillStyle = TOKENS.gold;
  ctx.fillText('—— volume atual', plot.x0 + 4, plot.y0 + 22);
}
