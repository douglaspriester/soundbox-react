import type { CanvasSize, Rotation } from './types';
import { TOKENS } from '../theme/tokens';
import { drawWireframeBox } from './primitives/wireframe3d';

export interface Room3DParams {
  length: number;
  width: number;
  height: number;
}

export function drawRoom3D(
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
  p: Room3DParams,
  rot: Rotation,
): void {
  drawWireframeBox(
    ctx,
    size,
    { w: p.length, h: p.height, d: p.width },
    rot,
    {
      fit: 0.5,
      onFront: (c, face) => {
        // DJ booth (upper third along length)
        const dj = face.at(0.18, 0.3);
        c.fillStyle = TOKENS.gold;
        c.beginPath();
        c.arc(dj[0], dj[1], 3, 0, Math.PI * 2);
        c.fill();
        c.font = '9px system-ui';
        c.textAlign = 'center';
        c.fillText('DJ', dj[0], dj[1] - 6);

        // sub at L/4 from the bar wall, on the floor
        const sub = face.at(-0.25, 0.42);
        c.fillStyle = TOKENS.infoStroke;
        c.fillRect(sub[0] - 3, sub[1] - 3, 6, 6);
        c.fillStyle = TOKENS.info;
        c.fillText('sub L/4', sub[0], sub[1] - 6);
      },
    },
  );

  ctx.fillStyle = TOKENS.text4;
  ctx.font = '9px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('arraste para rotacionar', 8, size.height - 8);
}
