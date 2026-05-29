import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, AlertList } from '../shared/ui';
import { NumberField, PresetButton } from '../shared/inputs';
import { Canvas } from '../Canvas';
import { HF_DRIVERS } from '../../data/driversHF';
import { alertsFor } from '../../physics/rules';
import { drawHfPowerChart } from '../../charts/hfPowerChart';
import { drawPolarDiagram } from '../../charts/polarDiagram';
import { drawHfComparison } from '../../charts/hfComparison';

export function Driver() {
  const { s, config, derived } = useModel();
  const d = config.driver;
  const selected = HF_DRIVERS.findIndex((x) => x.nm === config.driverPreset);
  const bars = HF_DRIVERS.map((x) => ({ nm: x.nm, spl: x.spl, rec: x.rec }));

  return (
    <>
      <SummaryCard>
        O driver HF faz os <b>agudos</b> a partir do waveguide. <em>fmin</em> é a frequência mais baixa segura —
        cruzar abaixo dela <b>queima o driver</b>. O <em>crossover</em> precisa ficar acima do fmin com margem, e
        o limiter no DSP protege contra picos.
      </SummaryCard>

      <Card title="parâmetros do driver">
        <div className="g2">
          <NumberField label="Sensibilidade (dB/W/m)" value={d.spl} step={0.5} min={95} onChange={(v) => s.setDriver({ spl: v })} />
          <NumberField label="Potência máx (W)" value={d.pw} step={5} min={10} hint="frágil — respeite o limiter" onChange={(v) => s.setDriver({ pw: v })} />
          <NumberField label="fmin — mínima segura (Hz)" value={d.fmin} step={50} min={300} hint="nunca cruzar abaixo disso" onChange={(v) => s.setDriver({ fmin: v })} />
          <NumberField label="Crossover (Hz)" value={d.xo} step={50} min={500} hint="acima do fmin com margem" onChange={(v) => s.setDriver({ xo: v })} />
          <NumberField label="Impedância (Ω)" value={d.imp} step={1} min={2} onChange={(v) => s.setDriver({ imp: v })} />
          <NumberField label="Cobertura (°)" value={d.cov} step={5} min={40} hint="ângulo do waveguide" onChange={(v) => s.setDriver({ cov: v })} />
        </div>
      </Card>

      <Card title="presets de drivers HF">
        {HF_DRIVERS.map((x) => (
          <PresetButton
            key={x.nm}
            name={x.nm}
            desc={x.nd}
            spec={x.nt}
            selected={config.driverPreset === x.nm}
            recommended={x.rec}
            onClick={() => s.applyDriver(x.nm)}
          />
        ))}
      </Card>

      <Card title="análise">
        <AlertList alerts={alertsFor('driver', config, derived)} />
      </Card>

      <Card title="SPL × frequência — zona de risco">
        <Canvas
          height={140}
          ariaLabel={`SPL do driver. Crossover ${d.xo}Hz ${derived.hfSafe ? 'seguro' : 'perigoso'} vs fmin ${d.fmin}Hz`}
          draw={(ctx, size) => drawHfPowerChart(ctx, size, { spl: d.spl, fmin: d.fmin, xo: d.xo })}
          deps={[d.spl, d.fmin, d.xo]}
        />
        <div className="chart-cap">Área vermelha = abaixo do fmin. A linha do crossover deve ficar à direita dela.</div>
      </Card>

      <Card title="diagrama polar — cobertura do waveguide">
        <Canvas
          height={150}
          ariaLabel={`Cobertura ${d.cov} graus`}
          draw={(ctx, size) => drawPolarDiagram(ctx, size, { cov: d.cov })}
          deps={[d.cov]}
        />
      </Card>

      <Card title="comparação de sensibilidade">
        <Canvas
          height={150}
          ariaLabel="Comparação de sensibilidade dos drivers HF"
          draw={(ctx, size) => drawHfComparison(ctx, size, { drivers: bars, selected })}
          deps={[selected]}
        />
      </Card>
    </>
  );
}
