import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, MetricTile, AlertList, StatRow } from '../shared/ui';
import { SliderField, SelectField } from '../shared/inputs';
import { Canvas } from '../Canvas';
import type { CabinetType } from '../../types';
import { qtc as qtcOf, fc as fcOf } from '../../physics/thieleSmall';
import { alertsFor } from '../../physics/rules';
import { drawCabinet3D } from '../../charts/cabinet3d';
import { drawCabinet2D } from '../../charts/cabinet2d';
import { drawGabResp } from '../../charts/gabResp';

export function Gabinete() {
  const { s, config, derived } = useModel();
  const w = config.woofer;
  const qtcIdeal = qtcOf(w.qts, w.vas, derived.vbSuggested);
  const fcIdeal = fcOf(w.fs, qtcIdeal, w.qts);
  const ext = derived.dims.external;

  return (
    <>
      <SummaryCard>
        O gabinete <b>selado</b> dá o grave mais firme e previsível — ideal para groove. O <em>Qtc</em> define o
        caráter: ~0.5 é seco e rápido, ~0.7 é o "livro-texto" plano. O volume sugerido sai do Qtc-alvo; ajuste e
        veja a curva mudar.
      </SummaryCard>

      <Card title="configuração da caixa">
        <SelectField<CabinetType>
          label="Tipo"
          value={config.cabinetType}
          options={[
            { value: 'sealed', label: 'Selado (recomendado)' },
            { value: 'br', label: 'Bass-reflex' },
          ]}
          onChange={(v) => s.setCabinet({ cabinetType: v })}
        />
        <SliderField label="Qtc alvo" value={config.targetQtc} min={0.4} max={0.85} step={0.01} decimals={2} onChange={(v) => s.setCabinet({ targetQtc: v, useCustomVolume: false })} />
        <label className="sr" style={{ cursor: 'pointer' }}>
          <span className="sk">
            <input type="checkbox" checked={config.useCustomVolume} onChange={(e) => s.setCabinet({ useCustomVolume: e.target.checked })} style={{ marginRight: 8, accentColor: 'var(--gold)' }} />
            Volume customizado
          </span>
          <span className="sv">{config.useCustomVolume ? 'manual' : `sugerido ${derived.vbSuggested.toFixed(0)}L`}</span>
        </label>
        {config.useCustomVolume && (
          <SliderField label="Volume interno" value={config.volumeL} unit="L" min={8} max={140} step={1} decimals={0} onChange={(v) => s.setCabinet({ volumeL: v })} />
        )}
      </Card>

      <Card title="resultado">
        <div className="g3">
          <MetricTile value={isFinite(derived.qtc) ? derived.qtc.toFixed(2) : '—'} label="Qtc" sub={derived.qtc < 0.6 ? 'seco' : derived.qtc <= 0.75 ? 'equilibrado' : 'cheio'} />
          <MetricTile value={derived.f3.toFixed(0)} label="Hz F3" />
          <MetricTile value={derived.vb.toFixed(0)} label="L volume" />
        </div>
        <StatRow label="Dimensões externas (MDF 25mm)" value={`${(ext.w * 100).toFixed(0)} × ${(ext.h * 100).toFixed(0)} × ${(ext.d * 100).toFixed(0)} cm`} />
        <StatRow label="MDF para o par" value={`~${derived.dims.mdfAreaPair.toFixed(1)} m²`} />
        <StatRow label="Fc (ressonância na caixa)" value={`${derived.fc.toFixed(0)} Hz`} />
        <AlertList alerts={alertsFor('gabinete', config, derived)} />
      </Card>

      <Card title="wireframe 3D — arraste para rotacionar">
        <Canvas
          height={210}
          ariaLabel="Gabinete em wireframe 3D"
          draggable
          initialRotation={{ x: 0.52, y: 0.62 }}
          draw={(ctx, size, rot) => drawCabinet3D(ctx, size, { w: ext.w, h: ext.h, d: ext.d, type: config.cabinetType }, rot)}
          deps={[ext.w, ext.h, ext.d, config.cabinetType]}
        />
      </Card>

      <Card title="vistas técnicas">
        <Canvas
          height={170}
          ariaLabel="Vista frontal e corte lateral do gabinete"
          draw={(ctx, size) => drawCabinet2D(ctx, size, { w: ext.w, h: ext.h, d: ext.d, type: config.cabinetType })}
          deps={[ext.w, ext.h, ext.d, config.cabinetType]}
        />
      </Card>

      <Card title="resposta — volume sugerido vs atual">
        <Canvas
          height={140}
          ariaLabel="Curva de resposta comparando volume sugerido e atual"
          draw={(ctx, size) => drawGabResp(ctx, size, { fcIdeal, qtcIdeal, fcCurrent: derived.fc, qtcCurrent: derived.qtc })}
          deps={[fcIdeal, qtcIdeal, derived.fc, derived.qtc]}
        />
      </Card>
    </>
  );
}
