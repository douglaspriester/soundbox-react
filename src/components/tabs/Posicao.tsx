import { useState } from 'react';
import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, StatRow, Alert, SubTabs } from '../shared/ui';
import { Canvas } from '../Canvas';
import { drawFloorPlan } from '../../charts/floorPlan';
import { InteractiveVenue } from '../InteractiveVenue';

type View = 'venue' | 'schematic';

export function Posicao() {
  const { config } = useModel();
  const [view, setView] = useState<View>('venue');

  return (
    <>
      <SummaryCard>
        Onde cada caixa fica muda tudo. As mains <b>anguladas ~28°</b> para o centro do público criam a imagem
        sonora; o sub a <b>L/4</b> evita o pior dos modos; e <b>4 JBL Control One</b> distribuídas (meio e fundo,
        E/D) <b>espalham o som</b> para o fundo da sala não ficar fraco — cada uma com delay no DSP para chegar em
        fase com as mains.
      </SummaryCard>

      <SubTabs<View>
        options={[{ id: 'venue', label: 'Layout do local' }, { id: 'schematic', label: 'Esquema acústico' }]}
        active={view}
        onChange={setView}
      />

      {view === 'venue' ? (
        <Card title="cobertura sonora — arraste as caixas">
          <InteractiveVenue />
        </Card>
      ) : (
        <Card title="planta baixa — proporção real da sala">
          <Canvas
            height={240}
            ariaLabel="Planta baixa esquemática com posicionamento de mains, sub e fills"
            draw={(ctx, size) => drawFloorPlan(ctx, size, { length: config.length, width: config.width, subCfg: config.subCfg })}
            deps={[config.length, config.width, config.subCfg]}
          />
          <div className="chart-cap">Escala fiel às dimensões da aba Sala ({config.length}×{config.width}m).</div>
        </Card>
      )}

      <Card title="regras de posicionamento">
        <StatRow label="Mains — distância da parede lateral" value="≥ 60 cm" />
        <StatRow label="Mains — toe-in" value="~28° para o centro" />
        <StatRow label="Mains — inclinação" value="levemente para baixo (público)" />
        <StatRow label="Sub" value={`L/4 = ${(config.length / 4).toFixed(1)}m, eixo central`} />
        <StatRow label="Fills" value="meio (~5m) e fundo (~10m)" />
      </Card>

      <Alert severity="error" title="Subs NUNCA debaixo do booth — a vibração chega aos Technics e faz o vinil pular" />
      <Alert severity="info" title="Após instalar, meça com UMIK-1 + REW e ajuste o EQ corretivo no DSP" />
    </>
  );
}
