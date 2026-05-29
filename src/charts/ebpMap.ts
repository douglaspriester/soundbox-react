import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';
import { plotArea } from './primitives/axes';

export interface EbpPoint {
  nm: string;
  ebp: number;
  qts: number;
  rec: boolean;
}

const EBP_MIN = 20, EBP_MAX = 200;
const QTS_MIN = 0.2, QTS_MAX: number = 0.45;

export function drawEbpMap(
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
  params: { points: EbpPoint[]; selected: number },
): void {
  const plot = plotArea(size, { l: 36, r: 12, t: 12, b: 24 });
  const xOf = (ebp: number) => plot.x0 + ((ebp - EBP_MIN) / (EBP_MAX - EBP_MIN)) * (plot.x1 - plot.x0);
  const yOf = (qts: number) => plot.y1 - ((qts - QTS_MIN) / (QTS_MAX - QTS_MIN)) * (plot.y1 - plot.y0);

  // zones: sealed (EBP<=100) / reflex (EBP>=100)
  const xSplit = xOf(100);
  ctx.fillStyle = TOKENS.infoFill;
  ctx.fillRect(plot.x0, plot.y0, xSplit - plot.x0, plot.y1 - plot.y0);
  ctx.fillStyle = TOKENS.warnFill;
  ctx.fillRect(xSplit, plot.y0, plot.x1 - xSplit, plot.y1 - plot.y0);

  ctx.font = '9px system-ui';
  ctx.fillStyle = TOKENS.info;
  ctx.textAlign = 'center';
  ctx.fillText('selado', (plot.x0 + xSplit) / 2, plot.y0 + 11);
  ctx.fillStyle = TOKENS.warn;
  ctx.fillText('bass-reflex', (xSplit + plot.x1) / 2, plot.y0 + 11);

  // axes labels
  ctx.fillStyle = TOKENS.text4;
  ctx.fillText('EBP →', (plot.x0 + plot.x1) / 2, plot.y1 + 16);
  ctx.save();
  ctx.translate(10, (plot.y0 + plot.y1) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Qts →', 0, 0);
  ctx.restore();

  params.points.forEach((pt, idx) => {
    const x = xOf(Math.max(EBP_MIN, Math.min(EBP_MAX, pt.ebp)));
    const y = yOf(Math.max(QTS_MIN, Math.min(QTS_MAX, pt.qts)));
    const sel = idx === params.selected;
    ctx.beginPath();
    ctx.arc(x, y, sel ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = pt.rec ? TOKENS.gold : TOKENS.text2;
    ctx.fill();
    if (sel) {
      ctx.strokeStyle = TOKENS.gold;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}
