import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';

export interface HfBar {
  nm: string;
  spl: number;
  rec: boolean;
}

export function drawHfComparison(
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
  params: { drivers: HfBar[]; selected: number },
): void {
  const padL = 8, padR = 10, padT = 8, padB = 8;
  const n = params.drivers.length;
  const rowH = (size.height - padT - padB) / n;
  const minSpl = 104, maxSpl = 114;
  const barX = 96;
  const barMax = size.width - barX - padR;

  ctx.font = '10px system-ui';
  params.drivers.forEach((d, i) => {
    const y = padT + i * rowH;
    const sel = i === params.selected;
    ctx.fillStyle = sel ? TOKENS.gold : TOKENS.text2;
    ctx.textAlign = 'left';
    ctx.fillText(d.nm, padL, y + rowH / 2 + 3);

    const w = Math.max(4, ((d.spl - minSpl) / (maxSpl - minSpl)) * barMax);
    ctx.fillStyle = sel ? TOKENS.gold : d.rec ? TOKENS.goldDim : TOKENS.surface3;
    ctx.fillRect(barX, y + rowH / 2 - 6, w, 12);
    ctx.fillStyle = TOKENS.text3;
    ctx.fillText(`${d.spl}dB`, barX + w + 5, y + rowH / 2 + 3);
  });
}
