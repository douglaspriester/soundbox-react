import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';
import { plotArea, drawFreqGrid, drawDbGrid, xLog } from './primitives/axes';
import { responseDb, qtc as qtcOf, fc as fcOf, vbForQtc } from '../physics/thieleSmall';

export interface WooferCurve {
  nm: string;
  fs: number;
  qts: number;
  vas: number;
}

const PALETTE = [TOKENS.gold, TOKENS.infoStroke, TOKENS.okStroke, TOKENS.warnStroke, TOKENS.violet];

export function drawWooferComparison(
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
  params: { woofers: WooferCurve[]; selected: number },
): void {
  const plot = plotArea(size);
  drawFreqGrid(ctx, plot);
  const yOf = drawDbGrid(ctx, plot, -24, 6, 6);

  params.woofers.forEach((wf, idx) => {
    const vb = vbForQtc(wf.vas, wf.qts, 0.5);
    const q = qtcOf(wf.qts, wf.vas, vb);
    const fc = fcOf(wf.fs, q, wf.qts);
    const isSel = idx === params.selected;
    ctx.strokeStyle = PALETTE[idx % PALETTE.length];
    ctx.globalAlpha = isSel ? 1 : 0.4;
    ctx.lineWidth = isSel ? 2.2 : 1.2;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 200; i++) {
      const f = 20 * Math.pow(1000, i / 200);
      const db = Math.max(-24, Math.min(6, responseDb(f, fc, q)));
      const x = xLog(f, plot);
      const y = yOf(db);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // legend
  ctx.font = '9px system-ui';
  ctx.textAlign = 'left';
  params.woofers.forEach((wf, idx) => {
    ctx.fillStyle = PALETTE[idx % PALETTE.length];
    ctx.globalAlpha = idx === params.selected ? 1 : 0.6;
    ctx.fillText(wf.nm, plot.x0 + 4, plot.y0 + 10 + idx * 11);
  });
  ctx.globalAlpha = 1;
}
