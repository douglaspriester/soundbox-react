import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, MetricTile, AlertList, StatRow } from '../shared/ui';
import { SliderField } from '../shared/inputs';
import { alertsFor } from '../../physics/rules';

export function Sistema() {
  const { s, config, derived } = useModel();
  return (
    <>
      <SummaryCard>
        Aqui o sistema é avaliado como um todo. <b>SPL alvo</b> é o volume contínuo desejado ({config.splTarget}dB).
        O <em>headroom</em> é a margem antes da distorção — quanto maior, mais limpo nos picos. Para 80dB a {config.distance}m
        o sistema usa só ~{derived.wattsNeeded.toFixed(1)}W, sobrando muita reserva.
      </SummaryCard>

      <Card title="alvo">
        <SliderField label="SPL alvo (contínuo)" value={config.splTarget} unit="dB" min={70} max={100} step={1} decimals={0} onChange={(v) => s.setSystem({ splTarget: v })} />
        <SliderField label="Distância de escuta" value={config.distance} unit="m" min={1} max={12} step={0.5} onChange={(v) => s.setSystem({ distance: v })} />
      </Card>

      <Card title="desempenho">
        <div className="g3">
          <MetricTile value={derived.splAtDistance.toFixed(0)} label={`dB máx @ ${config.distance}m`} />
          <MetricTile value={derived.headroom.toFixed(0)} label="dB headroom" sub={derived.headroom >= 12 ? 'excelente' : derived.headroom >= 6 ? 'ok' : 'baixo'} />
          <MetricTile value={`${derived.score}/10`} label="nota do sistema" />
        </div>
        <StatRow label="SPL máx do woofer (1m)" value={`${derived.wooferMaxSpl.toFixed(0)} dB`} />
        <StatRow label="SPL máx do driver HF (1m)" value={`${derived.driverMaxSpl.toFixed(0)} dB`} />
        <StatRow label="Potência necessária p/ alvo" value={`~${derived.wattsNeeded.toFixed(1)} W`} />
        <AlertList alerts={alertsFor('sistema', config, derived)} />
      </Card>
    </>
  );
}
