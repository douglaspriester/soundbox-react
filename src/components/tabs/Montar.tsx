import { useStore } from '../../store/useStore';
import { SYSTEMS } from '../../data/systems';
import { Card, SummaryCard } from '../shared/ui';
import { InteractiveVenue } from '../InteractiveVenue';

export function Montar() {
  const selected = useStore((s) => s.selectedSystem);
  const apply = useStore((s) => s.applySystem);

  return (
    <>
      <SummaryCard>
        Escolha o conjunto <b>caixa + driver</b>. O mapa embaixo recalcula a <b>cobertura sonora</b> pra cada opção
        (usa a sensibilidade e potência do woofer e o ângulo do driver). Depois <b>arraste, gire e adicione</b> as
        caixas pra ver como fica no seu espaço.
      </SummaryCard>

      <div className="sysgrid">
        {SYSTEMS.map((s) => (
          <div
            key={s.id}
            className={`syscard${selected === s.id ? ' on' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={selected === s.id}
            onClick={() => apply(s.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(s.id); } }}
          >
            <div className="systier">{s.tier}{selected === s.id ? ' · selecionado' : ''}</div>
            <div className="sysname">{s.name}</div>
            <div className="sysspec">{s.wooferName} + {s.driverName}</div>
            <div className="sysblurb">{s.blurb}</div>
            <div className="sysprice">~R$ {s.pricePerCab.toLocaleString('pt-BR')}/caixa</div>
            <div className="syslinks">
              {s.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" title={l.note} onClick={(e) => e.stopPropagation()}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card title="cobertura sonora — arraste · gire · adicione">
        <InteractiveVenue />
      </Card>
    </>
  );
}
