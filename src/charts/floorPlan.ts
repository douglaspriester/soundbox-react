import type { CanvasSize } from './types';
import type { SubConfig } from '../types';
import { TOKENS } from '../theme/tokens';

export interface FloorPlanParams {
  length: number;
  width: number;
  subCfg: SubConfig;
}

/** Top-down positioning plan: mains (toe-in 28°), sub at L/4, DJ booth, fills. */
export function drawFloorPlan(ctx: CanvasRenderingContext2D, size: CanvasSize, p: FloorPlanParams): void {
  const pad = 22;
  const aspect = p.length / p.width;
  let rw = size.width - pad * 2;
  let rh = rw / aspect;
  if (rh > size.height - pad * 2) {
    rh = size.height - pad * 2;
    rw = rh * aspect;
  }
  const x0 = (size.width - rw) / 2;
  const y0 = (size.height - rh) / 2;

  // room
  ctx.strokeStyle = TOKENS.gridStrong;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x0, y0, rw, rh);

  const px = (frac: number) => x0 + frac * rw; // along length
  const py = (frac: number) => y0 + frac * rh; // along width
  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';

  // DJ booth — upper third (left end)
  const djx = px(0.16), djy = py(0.5);
  ctx.strokeStyle = TOKENS.gold;
  ctx.beginPath(); ctx.arc(djx, djy, 12, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = TOKENS.gold;
  ctx.fillText('DJ', djx, djy + 3);

  // mains beside booth, toed-in ~28° toward center line
  const m4 = (my: number, dir: number) => {
    const mx = px(0.1);
    ctx.fillStyle = TOKENS.gold;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate((28 * Math.PI) / 180 * dir);
    ctx.fillRect(-4, -7, 8, 14);
    ctx.restore();
  };
  m4(py(0.28), 1);
  m4(py(0.72), -1);

  // sub at L/4
  const subx = px(0.25), suby = py(0.5);
  ctx.fillStyle = TOKENS.infoStroke;
  ctx.fillRect(subx - 6, suby - 6, 12, 12);
  ctx.fillStyle = TOKENS.info;
  ctx.fillText('sub', subx, suby + 22);
  ctx.fillText(p.subCfg === 'card' ? 'cardioid' : p.subCfg === 'sym' ? 'simétrico' : 'end-fire', subx + 4, suby - 12);

  // fills along the room
  ctx.fillStyle = TOKENS.violet;
  for (const f of [0.45, 0.72]) {
    ctx.fillRect(px(f) - 3, py(0.06) - 3, 6, 6);
    ctx.fillRect(px(f) - 3, py(0.94) - 3, 6, 6);
  }

  // audience
  ctx.fillStyle = TOKENS.text4;
  ctx.fillText('público / bar →', px(0.7), py(0.5));
}
