import { useState } from 'react';
import { Card, SummaryCard, SubTabs, StatRow } from '../shared/ui';
import { FULL_BUDGET, ECONOMY_BUDGET, VENDORS, sumBudget, sumSavings } from '../../data/budget';

type Mode = 'full' | 'eco';

export function Orca() {
  const [mode, setMode] = useState<Mode>('eco');
  const items = mode === 'full' ? FULL_BUDGET : ECONOMY_BUDGET;
  const total = sumBudget(items);
  const savings = mode === 'eco' ? sumSavings(items) : 0;

  return (
    <>
      <SummaryCard>
        Dois caminhos: o <b>cap R$ 50k</b> (R$ {sumBudget(ECONOMY_BUDGET).toLocaleString('pt-BR')}) — versão confirmada pra Bar Rio, com <b>acústica como maior investimento</b> (R$ 15k) — ou o <b>completo</b> (R$ {sumBudget(FULL_BUDGET).toLocaleString('pt-BR')}) do relatório original. Filosofia listening bar: a sala é o primeiro instrumento; sub é coadjuvante.
      </SummaryCard>

      <SubTabs<Mode>
        options={[{ id: 'eco', label: 'Cap R$ 50k (confirmado)' }, { id: 'full', label: 'Completo (relatório)' }]}
        active={mode}
        onChange={setMode}
      />

      <Card title={mode === 'full' ? 'orçamento completo (referência)' : 'orçamento cap R$ 50k — Bar Rio'}>
        {items.map((it) => (
          <div className="cp" key={it.name}>
            <div>
              <div className="cn">
                {it.name}
                {it.saving ? <span className="etag">−R$ {it.saving.toLocaleString('pt-BR')}</span> : null}
              </div>
              <div className="cd">{it.category} · {it.description}</div>
            </div>
            <div className="pr">{it.price === 0 ? '—' : `R$ ${it.price.toLocaleString('pt-BR')}`}</div>
          </div>
        ))}
        <div className="div" />
        <StatRow label="Total" value={<b style={{ color: 'var(--gold)', fontSize: 16 }}>R$ {total.toLocaleString('pt-BR')}</b>} />
        {savings > 0 && <StatRow label="Economia total" value={`R$ ${savings.toLocaleString('pt-BR')}`} />}
      </Card>

      <Card title="onde comprar no Brasil">
        {VENDORS.map((v) => (
          <StatRow key={v.products} label={v.products} value={v.stores} />
        ))}
      </Card>
    </>
  );
}
