import { useModel } from '../../hooks/useModel';
import { Card, SummaryCard, Alert } from '../shared/ui';
import { derive } from '../../physics/derive';

function row(label: string, a: string, b: string) {
  return (
    <div className="cmp" key={label}>
      <span className="sk">{label}</span>
      <span className="a">{a}</span>
      <span className="b">{b}</span>
    </div>
  );
}

export function Comparar() {
  const { s, config, derived } = useModel();
  const b = s.snapshotB;
  const db = b ? derive(b) : null;

  return (
    <>
      <SummaryCard>
        Compare dois sistemas lado a lado. Configure o <b>sistema A</b> (atual), salve como <b>B</b>, depois mude
        os parâmetros para criar uma alternativa e veja as diferenças nas métricas-chave.
      </SummaryCard>

      <Card title="snapshot">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn gold" onClick={() => s.saveToB()}>Salvar config atual como B</button>
          {b && <button className="btn" onClick={() => s.clearB()}>Limpar B</button>}
        </div>
      </Card>

      {!db && <Alert severity="info" title="Salve um snapshot B para comparar" detail="A coluna A é sempre a configuração atual." />}

      {db && b && (
        <Card title="A (atual) vs B (salvo)">
          <div className="cmp head">
            <span>métrica</span>
            <span className="a" style={{ color: 'var(--gold)' }}>A</span>
            <span className="b" style={{ color: 'var(--info)' }}>B</span>
          </div>
          {row('Woofer', config.wooferPreset || 'custom', b.wooferPreset || 'custom')}
          {row('Qtc', derived.qtc.toFixed(2), db.qtc.toFixed(2))}
          {row('F3', `${derived.f3.toFixed(0)}Hz`, `${db.f3.toFixed(0)}Hz`)}
          {row('Volume', `${derived.vb.toFixed(0)}L`, `${db.vb.toFixed(0)}L`)}
          {row('SPL máx @ dist', `${derived.splAtDistance.toFixed(0)}dB`, `${db.splAtDistance.toFixed(0)}dB`)}
          {row('Headroom', `${derived.headroom.toFixed(0)}dB`, `${db.headroom.toFixed(0)}dB`)}
          {row('Watts p/ alvo', `${derived.wattsNeeded.toFixed(1)}W`, `${db.wattsNeeded.toFixed(1)}W`)}
          {row('RT60 nua', `${derived.rt60ms.toFixed(0)}ms`, `${db.rt60ms.toFixed(0)}ms`)}
          {row('Nota', `${derived.score}/10`, `${db.score}/10`)}
        </Card>
      )}
    </>
  );
}
