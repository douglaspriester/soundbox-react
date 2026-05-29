import { useEffect, useLayoutEffect, useRef } from 'react';
import { TOKENS } from '../theme/tokens';
import type { CanvasSize, Rotation } from '../charts/types';

interface Props {
  height: number;
  ariaLabel: string;
  draw: (ctx: CanvasRenderingContext2D, size: CanvasSize, rot: Rotation) => void;
  deps: unknown[];
  draggable?: boolean;
  initialRotation?: Rotation;
}

/**
 * The single canvas surface. Owns devicePixelRatio scaling (via setTransform —
 * never cumulative scale()), a ResizeObserver for fluid width, rAF-coalesced
 * repaint, and unified Pointer Events drag (rotation kept in a ref so dragging
 * never triggers a React re-render). Pure chart `draw` fns receive CSS-pixel size.
 */
export function Canvas({ height, ariaLabel, draw, deps, draggable = false, initialRotation }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const rotRef = useRef<Rotation>(initialRotation ?? { x: 0.5, y: 0.6 });
  const scheduleRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const cssW = canvas.clientWidth || canvas.parentElement?.clientWidth || 320;
      const cssH = height;
      const dpr = window.devicePixelRatio || 1;
      const nw = Math.max(1, Math.round(cssW * dpr));
      const nh = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== nw) canvas.width = nw;
      if (canvas.height !== nh) canvas.height = nh;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = TOKENS.canvas;
      ctx.fillRect(0, 0, cssW, cssH);
      drawRef.current(ctx, { width: cssW, height: cssH }, rotRef.current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    scheduleRef.current = schedule;
    canvas.style.height = `${height}px`;
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(canvas);
    return () => { ro.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [height]);

  // repaint on data changes
  useEffect(() => { scheduleRef.current(); }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  // pointer drag rotation
  useEffect(() => {
    if (!draggable) return;
    const canvas = ref.current;
    if (!canvas) return;
    let dragging = false, lx = 0, ly = 0;
    const down = (e: PointerEvent) => {
      dragging = true; lx = e.clientX; ly = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* noop */ }
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const r = rotRef.current;
      const nx = Math.max(-1.45, Math.min(1.45, r.x + (e.clientY - ly) * 0.01));
      rotRef.current = { x: nx, y: r.y + (e.clientX - lx) * 0.01 };
      lx = e.clientX; ly = e.clientY;
      scheduleRef.current();
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, [draggable]);

  return <canvas ref={ref} role="img" aria-label={ariaLabel} className={draggable ? 'grab' : undefined} />;
}
