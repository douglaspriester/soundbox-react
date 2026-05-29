import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { TOKENS } from '../theme/tokens';
import type { Emitter } from '../physics/coverage';
import { splAtPoint, coverageStats } from '../physics/coverage';
import type { Speaker } from '../types';

const AUDIENCE = { x0: 0.05, y0: 0.42, x1: 0.95, y1: 0.96 };
const MARGIN = 14;
const CANVAS_H = 320;
const FILL_SENS = 89; // JBL Control One sensitivity
const FILL_PW = 40; // nominal fill power (W)
const AIM_REACH_M = 1.4; // rotation handle distance from the speaker, meters

const maxSpl = (sens: number, pw: number) => sens + 10 * Math.log10(Math.max(pw, 1));

interface Drag { id: string; mode: 'move' | 'rotate'; x: number; y: number; aimDeg: number }

function emitterOf(sp: Speaker, wm: number, hm: number, wooferSpl: number, wooferPw: number, driverCov: number): Emitter | null {
  if (sp.kind === 'sub') return null; // LF is non-directional — not part of the coverage map
  return {
    x: sp.x * wm,
    y: sp.y * hm,
    aimDeg: sp.aimDeg,
    covDeg: sp.kind === 'main' ? driverCov : 150,
    // Main level reflects the selected woofer preset's sensitivity AND power handling.
    level: sp.kind === 'main' ? maxSpl(wooferSpl, wooferPw) : maxSpl(FILL_SENS, FILL_PW),
    directional: true,
  };
}

function cellColor(d: number): string | null {
  if (d < -11) return null;
  if (d < -3) { const t = (d + 11) / 8; return `rgba(74,120,200,${0.16 + 0.2 * t})`; }
  if (d <= 3) return 'rgba(200,169,110,0.42)';
  if (d <= 8) { const t = (d - 3) / 5; return `rgba(${212 + t * 28},${150 - t * 70},${95 - t * 55},0.44)`; }
  return 'rgba(240,92,64,0.52)';
}

export function InteractiveVenue() {
  const speakers = useStore((s) => s.layout.speakers);
  const moveSpeaker = useStore((s) => s.moveSpeaker);
  const rotateSpeaker = useStore((s) => s.rotateSpeaker);
  const addSpeaker = useStore((s) => s.addSpeaker);
  const removeSpeaker = useStore((s) => s.removeSpeaker);
  const resetLayout = useStore((s) => s.resetLayout);
  const length = useStore((s) => s.length);
  const width = useStore((s) => s.width);
  const wooferSpl = useStore((s) => s.woofer.spl);
  const wooferPw = useStore((s) => s.woofer.pw);
  const driverCov = useStore((s) => s.driver.cov);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [bg, setBg] = useState<HTMLImageElement | null>(null);

  // Optional venue render as the map background. Drop a top-down image at
  // public/venue-bg.(png|jpg) and it appears automatically under the heatmap.
  useEffect(() => {
    let cancelled = false;
    const tryLoad = (srcs: string[]) => {
      if (!srcs.length) return;
      const im = new Image();
      im.onload = () => { if (!cancelled) setBg(im); };
      im.onerror = () => { if (!cancelled) tryLoad(srcs.slice(1)); };
      im.src = srcs[0];
    };
    tryLoad(['/venue-bg.png', '/venue-bg.jpg', '/venue-bg.jpeg']);
    return () => { cancelled = true; };
  }, []);

  const eff = useMemo<Speaker[]>(() => {
    if (!drag) return speakers;
    return speakers.map((sp) =>
      sp.id === drag.id ? { ...sp, ...(drag.mode === 'move' ? { x: drag.x, y: drag.y } : { aimDeg: drag.aimDeg }) } : sp,
    );
  }, [speakers, drag]);

  const emitters = useMemo(
    () => eff.map((sp) => emitterOf(sp, length, width, wooferSpl, wooferPw, driverCov)).filter((e): e is Emitter => e !== null),
    [eff, length, width, wooferSpl, wooferPw, driverCov],
  );
  const stats = useMemo(() => coverageStats(emitters, length, width, AUDIENCE), [emitters, length, width]);

  const counts = useMemo(() => {
    const c = { main: 0, fill: 0, sub: 0 };
    for (const sp of eff) c[sp.kind]++;
    return c;
  }, [eff]);

  const paint = useRef<() => void>(() => {});
  useEffect(() => {
    paint.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.clientWidth || 320;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(W * dpr)) canvas.width = Math.round(W * dpr);
      if (canvas.height !== Math.round(CANVAS_H * dpr)) canvas.height = Math.round(CANVAS_H * dpr);
      canvas.style.height = `${CANVAS_H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, CANVAS_H);
      ctx.fillStyle = TOKENS.canvas;
      ctx.fillRect(0, 0, W, CANVAS_H);

      const x0 = MARGIN, y0 = MARGIN, w = W - MARGIN * 2, h = CANVAS_H - MARGIN * 2;
      const FX = (f: number) => x0 + f * w;
      const FY = (f: number) => y0 + f * h;
      const M2Cx = (mx: number) => x0 + (mx / length) * w;
      const M2Cy = (my: number) => y0 + (my / width) * h;

      // venue render background (if provided) + dark veil so the heatmap reads
      if (bg) {
        ctx.drawImage(bg, x0, y0, w, h);
        ctx.fillStyle = 'rgba(7,7,7,0.42)';
        ctx.fillRect(x0, y0, w, h);
      }

      // heatmap
      const cols = 56, rows = 32, cw = w / cols, ch = h / rows;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const spl = splAtPoint(((i + 0.5) / cols) * length, ((j + 0.5) / rows) * width, emitters);
          const c = cellColor(spl - stats.mean);
          if (c) { ctx.fillStyle = c; ctx.fillRect(x0 + i * cw, y0 + j * ch, cw + 0.6, ch + 0.6); }
        }
      }

      // room + audience zone
      ctx.strokeStyle = TOKENS.gridStrong; ctx.lineWidth = 1.4; ctx.strokeRect(x0, y0, w, h);
      ctx.strokeStyle = TOKENS.grid; ctx.setLineDash([4, 4]);
      ctx.strokeRect(FX(AUDIENCE.x0), FY(AUDIENCE.y0), (AUDIENCE.x1 - AUDIENCE.x0) * w, (AUDIENCE.y1 - AUDIENCE.y0) * h);
      ctx.setLineDash([]);
      ctx.font = '9px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = TOKENS.text4;
      ctx.fillText('zona do público', FX(AUDIENCE.x0) + 4, FY(AUDIENCE.y1) - 5);

      // booth (drawn only when there's no venue render — the image already has it)
      if (!bg) {
        const bx = FX(0.5), by = FY(0.13), rO = Math.min(w, h) * 0.12, rI = rO * 0.6;
        ctx.fillStyle = 'rgba(242,242,242,0.9)';
        ctx.beginPath();
        ctx.arc(bx, by, rO, Math.PI * 0.08, Math.PI * 0.92, false);
        ctx.arc(bx, by, rI, Math.PI * 0.92, Math.PI * 0.08, true);
        ctx.closePath(); ctx.fill();
      }

      // speakers
      ctx.textAlign = 'center';
      const idx = { main: 0, fill: 0, sub: 0 };
      for (const sp of eff) {
        idx[sp.kind]++;
        const cx = FX(sp.x), cy = FY(sp.y);
        const isSel = selected === sp.id;
        const isDragged = drag?.id === sp.id;

        // aim line + rotation tip (main/fill)
        if (sp.kind !== 'sub') {
          const rad = (sp.aimDeg * Math.PI) / 180;
          const tipMx = sp.x * length + Math.cos(rad) * AIM_REACH_M;
          const tipMy = sp.y * width + Math.sin(rad) * AIM_REACH_M;
          const tcx = M2Cx(tipMx), tcy = M2Cy(tipMy);
          ctx.strokeStyle = isSel || isDragged ? TOKENS.gold : 'rgba(200,169,110,0.4)';
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tcx, tcy); ctx.stroke();
          ctx.beginPath(); ctx.arc(tcx, tcy, 5, 0, Math.PI * 2);
          ctx.fillStyle = drag?.id === sp.id && drag.mode === 'rotate' ? TOKENS.gold : TOKENS.surface3;
          ctx.fill(); ctx.strokeStyle = TOKENS.gold; ctx.lineWidth = 1; ctx.stroke();
        }

        // drag affordance ring
        ctx.strokeStyle = isSel ? TOKENS.gold : 'rgba(255,255,255,0.32)';
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.stroke();

        if (sp.kind === 'main') {
          ctx.save(); ctx.translate(cx, cy);
          ctx.fillStyle = '#9c6438'; ctx.strokeStyle = TOKENS.gold; ctx.lineWidth = 1;
          ctx.fillRect(-8, -6, 16, 12); ctx.strokeRect(-8, -6, 16, 12);
          ctx.restore();
          ctx.fillStyle = TOKENS.gold; ctx.fillText(`Main ${idx.main}`, cx, cy - 17);
        } else if (sp.kind === 'sub') {
          ctx.fillStyle = TOKENS.infoStroke; ctx.strokeStyle = '#000';
          ctx.fillRect(cx - 8, cy - 8, 16, 7); ctx.strokeRect(cx - 8, cy - 8, 16, 7);
          ctx.fillRect(cx - 8, cy + 1, 16, 7); ctx.strokeRect(cx - 8, cy + 1, 16, 7);
          ctx.fillStyle = TOKENS.info; ctx.fillText('2× sub', cx, cy - 17);
        } else {
          ctx.fillStyle = TOKENS.violet; ctx.fillRect(cx - 4, cy - 4, 8, 8);
          ctx.fillStyle = TOKENS.violet; ctx.fillText(`Fill ${idx.fill}`, cx, cy - 16);
        }
      }
    };
    paint.current();
  });

  useEffect(() => {
    const ro = new ResizeObserver(() => paint.current());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  // ---- pointer ----
  const geom = () => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return { r, w: r.width - MARGIN * 2, h: r.height - MARGIN * 2 };
  };
  const onDown = (e: React.PointerEvent) => {
    const { r, w, h } = geom();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    // rotation tips first
    for (const sp of eff) {
      if (sp.kind === 'sub') continue;
      const rad = (sp.aimDeg * Math.PI) / 180;
      const tcx = MARGIN + ((sp.x * length + Math.cos(rad) * AIM_REACH_M) / length) * w;
      const tcy = MARGIN + ((sp.y * width + Math.sin(rad) * AIM_REACH_M) / width) * h;
      if (Math.hypot(mx - tcx, my - tcy) < 12) {
        setSelected(sp.id);
        setDrag({ id: sp.id, mode: 'rotate', x: sp.x, y: sp.y, aimDeg: sp.aimDeg });
        try { canvasRef.current!.setPointerCapture(e.pointerId); } catch { /* noop */ }
        return;
      }
    }
    // bodies
    let best: { id: string; d: number; sp: Speaker } | null = null;
    for (const sp of eff) {
      const cx = MARGIN + sp.x * w, cy = MARGIN + sp.y * h;
      const d = Math.hypot(mx - cx, my - cy);
      if (d < 18 && (!best || d < best.d)) best = { id: sp.id, d, sp };
    }
    if (best) {
      setSelected(best.id);
      setDrag({ id: best.id, mode: 'move', x: best.sp.x, y: best.sp.y, aimDeg: best.sp.aimDeg });
      try { canvasRef.current!.setPointerCapture(e.pointerId); } catch { /* noop */ }
    } else {
      setSelected(null);
    }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const { r, w, h } = geom();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    if (drag.mode === 'move') {
      setDrag({ ...drag, x: Math.max(0.03, Math.min(0.97, (px - MARGIN) / w)), y: Math.max(0.03, Math.min(0.97, (py - MARGIN) / h)) });
    } else {
      const bx = drag.x * length, by = drag.y * width;
      const pmx = ((px - MARGIN) / w) * length, pmy = ((py - MARGIN) / h) * width;
      setDrag({ ...drag, aimDeg: (Math.atan2(pmy - by, pmx - bx) * 180) / Math.PI });
    }
  };
  const onUp = (e: React.PointerEvent) => {
    if (drag) {
      if (drag.mode === 'move') moveSpeaker(drag.id, drag.x, drag.y);
      else rotateSpeaker(drag.id, drag.aimDeg);
      setDrag(null);
    }
    try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const quality = stats.spread <= 6 ? { t: 'uniforme', sev: 'ok' } : stats.spread <= 10 ? { t: 'aceitável', sev: 'warn' } : { t: 'irregular', sev: 'error' };
  const selSpeaker = eff.find((s) => s.id === selected);

  return (
    <div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Mapa de cobertura com ${counts.main} mains e ${counts.fill} fills. Uniformidade ${stats.spread.toFixed(0)} dB, ${stats.goodPct.toFixed(0)}% da zona do público com cobertura boa`}
        style={{ touchAction: 'none', cursor: drag ? 'grabbing' : 'grab' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        <button className="btn gold" onClick={() => addSpeaker('main')}>+ main</button>
        <button className="btn" onClick={() => addSpeaker('fill')}>+ fill</button>
        <button className="btn" onClick={() => addSpeaker('sub')}>+ sub</button>
        {selSpeaker && (
          <button className="btn" onClick={() => { removeSpeaker(selSpeaker.id); setSelected(null); }}>
            remover {selSpeaker.kind} selecionada
          </button>
        )}
        <button className="btn" onClick={() => { resetLayout(); setSelected(null); }}>restaurar</button>
      </div>

      <div className="g3" style={{ marginTop: 10 }}>
        <div className="mt"><div className="mv">{stats.goodPct.toFixed(0)}%</div><div className="ml">cobertura boa</div><div className="ms">da zona do público</div></div>
        <div className="mt"><div className="mv">±{(stats.spread / 2).toFixed(1)}</div><div className="ml">dB uniformidade</div><div className="ms">{quality.t}</div></div>
        <div className="mt"><div className="mv">{counts.main}+{counts.fill}+{counts.sub}</div><div className="ml">main+fill+sub</div><div className="ms">caixas no mapa</div></div>
      </div>

      <div className={`al ${quality.sev}`} style={{ marginTop: 8 }}>
        <div className="at">Arraste o corpo p/ mover · arraste a ponta da linha p/ girar</div>
        <div className="ad">
          Áreas <b style={{ color: TOKENS.gold }}>douradas</b> = som bom (nível parelho); <b style={{ color: '#f05c40' }}>quentes</b> = perto demais; <b style={{ color: '#4a78c8' }}>frias</b> = buracos.
          O mapa usa os falantes reais: SPL máx do woofer ({maxSpl(wooferSpl, wooferPw).toFixed(0)}dB = {wooferSpl}dB + {wooferPw}W) e cobertura do driver ({driverCov}°). Sub é não-direcional (fora do mapa, mas posicionável). Toque numa caixa pra selecionar/remover.
          {bg ? ' Fundo: render do local.' : ' (Para usar o render do local como fundo, coloque-o em public/venue-bg.png.)'}
        </div>
      </div>
    </div>
  );
}
