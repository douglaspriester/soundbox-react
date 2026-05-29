import { Card, SummaryCard, StepRow, StatRow } from '../shared/ui';

export function Montagem() {
  return (
    <>
      <SummaryCard>
        A ordem de montagem importa: rack escondido no booth, cabeamento balanceado, e <b>medição obrigatória</b>
        com UMIK-1 + REW antes de liberar o sistema. Sem medir, qualquer ajuste é chute.
      </SummaryCard>

      <Card title="rack técnico — 12U no booth (topo → base)">
        <StatRow label="1" value="miniDSP 2x4 HD" />
        <StatRow label="2" value="Crown XLS 1502 (mains LF)" />
        <StatRow label="3" value="Crown XLS 1002 (mains HF)" />
        <StatRow label="4" value="Crown XLS 2502 (sub, se passivo)" />
        <StatRow label="5" value="Behringer EP2000 (fills)" />
        <StatRow label="6" value="Power conditioner + ventilação" />
      </Card>

      <Card title="passo a passo">
        <StepRow n={1} title="Construir os gabinetes">MDF 25mm, baffle compensado naval 18mm, lã de rocha 50mm em 40% do volume, terminal Speakon NL4.</StepRow>
        <StepRow n={2} title="Montar o rack">Embutido no compartimento traseiro da mesa circular, ventilação ativa, 100% escondido.</StepRow>
        <StepRow n={3} title="Cabear">XLR balanceado para sinal, Speakon para potência. Separe sinal de força.</StepRow>
        <StepRow n={4} title="Programar o DSP">Crossovers, delays dos fills, limiter −3dB no driver HF (ver aba DSP).</StepRow>
        <StepRow n={5} title="Tratar a sala">Bass traps nos cantos, painéis nas primeiras reflexões, difusor no fundo.</StepRow>
        <StepRow n={6} title="Medir e calibrar">UMIK-1 + REW. EQ corretivo só depois da medição. Ajuste fino do delay e do nível do sub.</StepRow>
      </Card>
    </>
  );
}
