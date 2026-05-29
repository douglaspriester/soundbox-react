import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, MetricTile, StatRow, AlertList } from '../shared/ui';
import { evaluate } from '../../physics/rules';

export function Resumo() {
  const { config, derived } = useModel();
  const w = config.woofer;
  const critical = evaluate(config, derived).filter((a) => a.severity === 'error' || a.severity === 'warn');

  return (
    <>
      <SummaryCard>
        Sistema atual: woofer <em>{config.wooferPreset || 'custom'}</em> em caixa selada de{' '}
        <b>{derived.vb.toFixed(0)}L</b> (Qtc {derived.qtc.toFixed(2)}, corte em {derived.f3.toFixed(0)}Hz), com{' '}
        <b>{derived.headroom.toFixed(0)}dB de headroom</b> para o alvo de {config.splTarget}dB. A sala sem
        tratamento tem RT60 de <b>{(derived.rt60 * 1000).toFixed(0)}ms</b> contra os 400ms ideais. Nota geral{' '}
        <b>{derived.score}/10</b>.
      </SummaryCard>

      <Card title="números principais">
        <div className="g2">
          <MetricTile value={`${derived.score}/10`} label="nota do sistema" />
          <MetricTile value={`${derived.headroom.toFixed(0)}dB`} label="headroom" />
          <MetricTile value={`${derived.f3.toFixed(0)}Hz`} label="corte do woofer (F3)" />
          <MetricTile value={`${derived.rt60ms.toFixed(0)}ms`} label="RT60 da sala" sub="alvo 400" />
        </div>
      </Card>

      <Card title="sistema do relatório">
        <StatRow label="Woofer" value={`${config.wooferPreset || 'custom'} · ${w.spl}dB · Fs ${w.fs}Hz`} />
        <StatRow label="Driver HF" value={`${config.driverPreset || 'custom'} · ${config.driver.spl}dB`} />
        <StatRow label="Gabinete" value={`${config.cabinetType === 'sealed' ? 'Selado' : 'Bass-reflex'} ${derived.vb.toFixed(0)}L · Qtc ${derived.qtc.toFixed(2)}`} />
        <StatRow label="Sub" value={`${config.subCfg === 'card' ? 'cardioid' : config.subCfg} · crossover ${config.subFc}Hz`} />
        <StatRow label="Sala" value={`${config.length}×${config.width}×${config.height}m · ${derived.volume.toFixed(0)}m³`} />
      </Card>

      <Card title="alertas críticos">
        {critical.length ? <AlertList alerts={critical} /> : <StatRow label="Tudo certo" value="sem alertas críticos" />}
      </Card>
    </>
  );
}
