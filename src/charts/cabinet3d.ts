import type { CanvasSize, Rotation } from './types';
import type { CabinetType } from '../types';
import { TOKENS } from '../theme/tokens';
import { drawWireframeBox } from './primitives/wireframe3d';

export interface Cabinet3DParams {
  w: number;
  h: number;
  d: number;
  type: CabinetType;
}

export function drawCabinet3D(
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
  p: Cabinet3DParams,
  rot: Rotation,
): void {
  drawWireframeBox(ctx, size, { w: p.w, h: p.h, d: p.d }, rot, {
    fit: 0.46,
    onFront: (c, face) => {
      // woofer (lower-center)
      const wc = face.at(0, 0.16);
      const edge = face.at(0.34, 0.16);
      const rW = Math.hypot(edge[0] - wc[0], edge[1] - wc[1]);
      c.strokeStyle = TOKENS.gold;
      c.lineWidth = 1.4;
      c.beginPath(); c.arc(wc[0], wc[1], rW, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(wc[0], wc[1], rW * 0.4, 0, Math.PI * 2); c.stroke();

      // HF driver (upper-center)
      const hc = face.at(0, -0.3);
      const hEdge = face.at(0.14, -0.3);
      const rH = Math.hypot(hEdge[0] - hc[0], hEdge[1] - hc[1]);
      c.beginPath(); c.arc(hc[0], hc[1], rH, 0, Math.PI * 2); c.stroke();

      // bass-reflex port
      if (p.type === 'br') {
        const port = face.at(0.28, 0.4);
        const pe = face.at(0.36, 0.4);
        const rP = Math.hypot(pe[0] - port[0], pe[1] - port[1]);
        c.strokeStyle = TOKENS.infoStroke;
        c.beginPath(); c.arc(port[0], port[1], rP, 0, Math.PI * 2); c.stroke();
      }
    },
  });

  ctx.fillStyle = TOKENS.text4;
  ctx.font = '9px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('arraste para rotacionar', 8, size.height - 8);
}
