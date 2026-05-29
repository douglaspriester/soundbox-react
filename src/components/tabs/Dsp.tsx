import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, StatRow, Alert } from '../shared/ui';
import { SliderField } from '../shared/inputs';
import { delayMs } from '../../physics/spl';

export function Dsp() {
  const { s, config, derived } = useModel();
  return (
    <>
      <SummaryCard>
        O <b>miniDSP 2x4 HD</b> é o maestro: divide as frequências entre sub, woofer e driver, alinha os atrasos
        dos fills e protege o driver HF com um limiter. Estes são os valores para programar nele.
      </SummaryCard>

      <Card title="crossovers (Linkwitz-Riley 24dB/oct)">
        <SliderField label="Sub / Main" value={config.subFc} unit="Hz" min={40} max={120} step={1} decimals={0} onChange={(v) => s.setSub({ subFc: v })} />
        <StatRow label="LF / HF (woofer → driver)" value={`${config.driver.xo} Hz`} />
        <StatRow label="Mínimo recomendado (Schroeder)" value={`≥ ${derived.schroeder.toFixed(0)} Hz`} />
        {config.subFc < derived.schroeder && (
          <Alert severity="warn" title={`Crossover sub abaixo do Schroeder (${derived.schroeder.toFixed(0)}Hz) — a sala domina essa região`} />
        )}
      </Card>

      <Card title="delay dos 4 fills (JBL Control One)">
        {config.fills.map((fseg, i) => (
          <SliderField
            key={fseg.label}
            label={`${fseg.label} — ${delayMs(fseg.distanceCm).toFixed(1)} ms`}
            value={fseg.distanceCm}
            unit="cm"
            min={0}
            max={1500}
            step={10}
            decimals={0}
            onChange={(v) => s.setFill(i, v)}
          />
        ))}
        <div className="chart-cap">Delay = distância (cm) ÷ 34,3. Cada fill recebe esse atraso no DSP para chegar em fase com as mains.</div>
      </Card>

      <Card title="proteção e EQ">
        {derived.hfSafe ? (
          <Alert severity="ok" title="Crossover do driver HF seguro" detail="Configure mesmo assim o limiter em −3dB." />
        ) : (
          <Alert severity="error" title="Crossover abaixo do fmin — corrija na aba Driver HF antes de programar o DSP" />
        )}
        <StatRow label="Limiter driver HF" value="−3 dB threshold" />
        <StatRow label="EQ corretivo" value="pós-instalação com UMIK-1 + REW" />
        <StatRow label="Delay máx calculado" value={`${Math.max(...config.fills.map((fseg) => delayMs(fseg.distanceCm))).toFixed(1)} ms`} />
      </Card>
    </>
  );
}
