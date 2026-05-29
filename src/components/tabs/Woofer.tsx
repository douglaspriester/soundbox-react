import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, AlertList } from '../shared/ui';
import { NumberField, PresetButton } from '../shared/inputs';
import { Canvas } from '../Canvas';
import { WOOFERS } from '../../data/woofers';
import { ebp as ebpOf } from '../../physics/thieleSmall';
import { alertsFor } from '../../physics/rules';
import { drawResponseCurve } from '../../charts/responseCurve';
import { drawWooferComparison } from '../../charts/wooferComparison';
import { drawEbpMap } from '../../charts/ebpMap';

export function Woofer() {
  const { s, config, derived } = useModel();
  const w = config.woofer;
  const selected = WOOFERS.findIndex((x) => x.nm === config.wooferPreset);
  const points = WOOFERS.map((x) => ({ nm: x.nm, ebp: ebpOf(x.fs, x.qes), qts: x.qts, rec: x.rec }));
  const curves = WOOFERS.map((x) => ({ nm: x.nm, fs: x.fs, qts: x.qts, vas: x.vas }));

  return (
    <>
      <SummaryCard>
        O woofer faz o <b>grave e o médio-grave</b>. <em>Fs</em> = onde ele para de trabalhar bem. <em>Qts</em> =
        amortecimento (menor = grave mais firme). <em>98dB/W</em> é eficiente. Os <em>400W não são o volume</em> —
        são o limite térmico. Para 80dB a 4m o sistema usa só ~{derived.wattsNeeded.toFixed(1)}W.
      </SummaryCard>

      <Card title="parâmetros T-S">
        <div className="g2">
          <NumberField label="Fs — freq. natural (Hz)" value={w.fs} step={0.5} min={10} hint="menor = grave mais fundo" onChange={(v) => s.setWoofer({ fs: v })} />
          <NumberField label="Qts — amortecimento" value={w.qts} step={0.01} min={0.1} hint="0.28–0.4 ideal selado" onChange={(v) => s.setWoofer({ qts: v })} />
          <NumberField label="Qes" value={w.qes} step={0.01} min={0.1} onChange={(v) => s.setWoofer({ qes: v })} />
          <NumberField label="Qms" value={w.qms} step={0.1} min={0.5} onChange={(v) => s.setWoofer({ qms: v })} />
          <NumberField label="Vas — volume virtual (L)" value={w.vas} step={1} min={5} hint="determina o tamanho da caixa" onChange={(v) => s.setWoofer({ vas: v })} />
          <NumberField label="Xmax — excursão (mm)" value={w.xmax} step={0.5} min={1} hint="maior = mais headroom" onChange={(v) => s.setWoofer({ xmax: v })} />
          <NumberField label="Sensibilidade (dB/W/m)" value={w.spl} step={0.5} min={80} hint="maior = menos potência" onChange={(v) => s.setWoofer({ spl: v })} />
          <NumberField label="Potência máx (W)" value={w.pw} step={10} min={10} hint="limite térmico, não o volume" onChange={(v) => s.setWoofer({ pw: v })} />
        </div>
      </Card>

      <Card title="presets de drivers">
        {WOOFERS.map((x) => (
          <PresetButton
            key={x.nm}
            name={x.nm}
            desc={x.nd}
            spec={x.nt}
            selected={config.wooferPreset === x.nm}
            recommended={x.rec}
            onClick={() => s.applyWoofer(x.nm)}
          />
        ))}
      </Card>

      <Card title="análise">
        <AlertList alerts={alertsFor('woofer', config, derived)} />
      </Card>

      <Card title="curva de resposta simulada — selado">
        <Canvas
          height={140}
          ariaLabel={`Resposta selada, F3 ${derived.f3.toFixed(0)}Hz, Qtc ${derived.qtc.toFixed(2)}`}
          draw={(ctx, size) => drawResponseCurve(ctx, size, { fc: derived.fc, qtc: derived.qtc, f3: derived.f3 })}
          deps={[derived.fc, derived.qtc, derived.f3]}
        />
        <div className="chart-cap">A curva cai à esquerda: o driver não trabalha abaixo de Fs. O sub completa essa região.</div>
      </Card>

      <Card title="comparação entre woofers">
        <Canvas
          height={150}
          ariaLabel="Comparação de curvas de resposta dos woofers"
          draw={(ctx, size) => drawWooferComparison(ctx, size, { woofers: curves, selected })}
          deps={[selected]}
        />
      </Card>

      <Card title="EBP × Qts — selado ou bass-reflex">
        <Canvas
          height={150}
          ariaLabel={`Mapa EBP. Selecionado EBP ${derived.ebp.toFixed(0)}`}
          draw={(ctx, size) => drawEbpMap(ctx, size, { points, selected })}
          deps={[selected]}
        />
      </Card>
    </>
  );
}
