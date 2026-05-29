import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, AlertList, StatRow, Alert } from '../shared/ui';
import { SliderField, SelectField } from '../shared/inputs';
import type { SubConfig } from '../../types';
import { SUBS } from '../../data/subs';
import { alertsFor } from '../../physics/rules';

export function Sub() {
  const { s, config, derived } = useModel();
  return (
    <>
      <SummaryCard>
        O sub faz o <b>sub-grave</b> que dá peso ao groove. São <b>2 subs empilhados</b> em <em>cardioid stack</em>
        {' '}— manda energia para a frente e cancela atrás, essencial para não vibrar o booth e os Technics. Cruze
        com as mains em ~{config.subFc}Hz.{' '}
        {config.subFc >= derived.schroeder
          ? `Acima do Schroeder (${derived.schroeder.toFixed(0)}Hz), região bem comportada.`
          : `Isso fica abaixo do Schroeder (${derived.schroeder.toFixed(0)}Hz) — região modal, vai precisar de correção no DSP e do sub bem posicionado.`}
      </SummaryCard>

      <Card title="configuração">
        <SliderField label="Crossover sub/main" value={config.subFc} unit="Hz" min={40} max={120} step={1} decimals={0} onChange={(v) => s.setSub({ subFc: v })} />
        <SelectField<SubConfig>
          label="Arranjo dos subs"
          value={config.subCfg}
          options={[
            { value: 'card', label: 'Cardioid stack (recomendado)' },
            { value: 'sym', label: 'Simétrico (evitar)' },
            { value: 'ef', label: 'End-fire' },
          ]}
          onChange={(v) => s.setSub({ subCfg: v })}
        />
      </Card>

      <Card title="análise">
        <AlertList alerts={alertsFor('sub', config, derived)} />
        {config.subFc < derived.schroeder && (
          <Alert
            severity="warn"
            title={`Crossover ${config.subFc}Hz abaixo do Schroeder (${derived.schroeder.toFixed(0)}Hz)`}
            detail="Nessa faixa a sala domina por modos — capriche no posicionamento do sub (L/4) e no EQ corretivo."
          />
        )}
      </Card>

      <Card title="opções de subwoofer">
        {SUBS.map((x) => (
          <div className="cp" key={x.nm}>
            <div>
              <div className="cn">
                {x.nm}
                {x.rec && <span className="gold-tag">relatório</span>}
              </div>
              <div className="cd">{x.nd} · {x.nt}</div>
            </div>
            <div className="pr">R$ {x.preco.toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </Card>

      <Card title="posicionamento">
        <StatRow label="Quantidade" value="2 subs empilhados (cardioid stack)" />
        <StatRow label="Posição ideal" value={`L/4 = ${(config.length / 4).toFixed(1)}m da parede do bar`} />
        <StatRow label="Eixo" value="central, no chão (co-locados)" />
        <StatRow label="Nunca" value="um em cada lado (cria nulo no centro)" />
      </Card>
    </>
  );
}
