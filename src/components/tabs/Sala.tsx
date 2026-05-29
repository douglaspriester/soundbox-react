import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, MetricTile, AlertList } from '../shared/ui';
import { SliderField } from '../shared/inputs';
import { Canvas } from '../Canvas';
import { TREATMENTS } from '../../data/treatments';
import { rt60Bands } from '../../physics/acoustics';
import { alertsFor } from '../../physics/rules';
import { drawRoom3D } from '../../charts/room3d';
import { drawModes } from '../../charts/modesChart';
import { drawRt60Chart } from '../../charts/rt60Chart';
import { drawModalMap } from '../../charts/modalMap';

export function Sala() {
  const { s, config, derived } = useModel();
  const bands = rt60Bands(config.length, config.width, config.height, config.treatments);
  const showTreated = Object.values(config.treatments).some(Boolean);
  const lModes = derived.modes.filter((m) => m.axis === 'L').slice(0, 4);

  return (
    <>
      <SummaryCard>
        Tijolo e concreto nus refletem o som como espelho — pense em bater palma num banheiro de azulejo.{' '}
        <b>Sem tratamento o grave dura quase o dobro do tempo certo</b> e o groove soa borrado. Lã de rocha
        DIY por ~R$2.500 resolve a maior parte.
      </SummaryCard>

      <Card title="dimensões">
        <SliderField label="Comprimento" value={config.length} unit="m" min={6} max={20} step={0.5} onChange={(v) => s.setRoom({ length: v })} />
        <SliderField label="Largura" value={config.width} unit="m" min={2} max={12} step={0.5} onChange={(v) => s.setRoom({ width: v })} />
        <SliderField label="Altura" value={config.height} unit="m" min={2.5} max={10} step={0.5} onChange={(v) => s.setRoom({ height: v })} />
      </Card>

      <Card title="métricas acústicas">
        <div className="g3">
          <MetricTile value={derived.volume.toFixed(0)} label="m³ volume" />
          <MetricTile value={derived.rt60ms.toFixed(0)} label="ms RT60" sub={showTreated ? 'tratada · alvo 400' : 'nua · alvo 400'} />
          <MetricTile value={derived.schroeder.toFixed(0)} label="Hz Schroeder" />
        </div>
        <AlertList alerts={alertsFor('sala', config, derived)} />
      </Card>

      <Card title="wireframe 3D — arraste para rotacionar">
        <Canvas
          height={210}
          ariaLabel={`Sala ${config.length} por ${config.width} por ${config.height} metros`}
          draggable
          initialRotation={{ x: 0.42, y: 0.55 }}
          draw={(ctx, size, rot) => drawRoom3D(ctx, size, { length: config.length, width: config.width, height: config.height }, rot)}
          deps={[config.length, config.width, config.height]}
        />
      </Card>

      <Card title="modos axiais — frequências que ficam presas">
        <Canvas
          height={110}
          ariaLabel={`Modos axiais: ${lModes.map((m) => m.f.toFixed(0)).join(', ')} Hz`}
          draw={(ctx, size) => drawModes(ctx, size, { modes: lModes })}
          deps={[config.length]}
        />
        <div className="chart-cap">Cada cor = uma onda estacionária no eixo longo. Sub em L/4 (~{(config.length / 4).toFixed(1)}m) minimiza o modo fundamental.</div>
      </Card>

      <Card title="RT60 por frequência — antes vs depois do tratamento">
        <Canvas
          height={140}
          ariaLabel={`RT60 por banda. Médio nu ${(bands.bare[4] * 1000).toFixed(0)}ms, tratado ${(bands.treated[4] * 1000).toFixed(0)}ms`}
          draw={(ctx, size) => drawRt60Chart(ctx, size, { bare: bands.bare, treated: bands.treated, targetMs: config.rt60Target, showTreated })}
          deps={[config.length, config.width, config.height, JSON.stringify(config.treatments)]}
        />
        <div className="div" />
        {TREATMENTS.map((t) => (
          <label key={t.key} className="sr" style={{ cursor: 'pointer' }}>
            <span className="sk">
              <input
                type="checkbox"
                checked={config.treatments[t.key]}
                onChange={() => s.toggleTreatment(t.key)}
                style={{ marginRight: 8, accentColor: 'var(--gold)' }}
              />
              {t.label}
            </span>
            <span className="sv">{t.cost}</span>
          </label>
        ))}
      </Card>

      <Card title="mapa de pressão — distribuição do grave">
        <Canvas
          height={130}
          ariaLabel="Mapa de pressão modal no piso da sala"
          draw={(ctx, size) => drawModalMap(ctx, size, { length: config.length, width: config.width })}
          deps={[config.length, config.width]}
        />
      </Card>
    </>
  );
}
