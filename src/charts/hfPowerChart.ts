import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';
import { plotArea, drawFreqGrid, xLog } from './primitives/axes';

export interface HfPowerParams {
  spl: number;
  fmin: number;
  xo: number;
}

export function drawHfPowerChart(ctx: CanvasRenderingContext2D, size: CanvasSize, p: HfPowerParams): void {
  const plot = plotArea(size, { l: 30, r: 10, t: 12, b: 22 });
  drawFreqGrid(ctx, plot);

  // danger zone below fmin
  const xFmin = xLog(p.fmin, plot);
  ctx.fillStyle = TOKENS.errorFill;
  ctx.fillRect(plot.x0, plot.y0, xFmin - plot.x0, plot.y1 - plot.y0);
  ctx.strokeStyle = TOKENS.errorStroke;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(xFmin, plot.y0); ctx.lineTo(xFmin, plot.y1); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = TOKENS.error;
  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`fmin ${p.fmin}Hz`, xFmin, plot.y1 - 4);

  // crossover line
  const xXo = xLog(p.xo, plot);
  ctx.strokeStyle = p.xo >= p.fmin ? TOKENS.okStroke : TOKENS.errorStroke;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(xXo, plot.y0); ctx.lineTo(xXo, plot.y1); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = p.xo >= p.fmin ? TOKENS.ok : TOKENS.error;
  ctx.fillText(`XO ${p.xo}Hz`, xXo, plot.y0 + 10);

  // sensitivity curve: flat in band, rolls off below fmin
  ctx.strokeStyle = TOKENS.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 200; i++) {
    const f = 20 * Math.pow(1000, i / 200);
    const rolloff = f < p.fmin ? -(p.fmin / Math.max(f, 1) - 1) * 18 : 0;
    const level = p.spl + Math.max(-30, rolloff);
    const y = plot.y1 - ((level - 80) / (118 - 80)) * (plot.y1 - plot.y0);
    const x = xLog(f, plot);
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
