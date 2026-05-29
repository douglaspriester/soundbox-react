import { useState } from 'react';
import type { TabId } from './types';
import { useStore, configOf } from './store/useStore';
import { buildShareUrl, writeHash } from './store/share';
import { TABS } from './appTabs';
import { TabNav } from './components/Nav/TabNav';
import { Montar } from './components/tabs/Montar';
import { Resumo } from './components/tabs/Resumo';
import { Sala } from './components/tabs/Sala';
import { Woofer } from './components/tabs/Woofer';
import { Driver } from './components/tabs/Driver';
import { Sub } from './components/tabs/Sub';
import { Gabinete } from './components/tabs/Gabinete';
import { Sistema } from './components/tabs/Sistema';
import { Dsp } from './components/tabs/Dsp';
import { Posicao } from './components/tabs/Posicao';
import { Montagem } from './components/tabs/Montagem';
import { Orca } from './components/tabs/Orca';
import { Comparar } from './components/tabs/Comparar';

const PANELS: Record<TabId, () => React.ReactElement> = {
  montar: Montar,
  resumo: Resumo,
  sala: Sala,
  woofer: Woofer,
  driver: Driver,
  sub: Sub,
  gabinete: Gabinete,
  sistema: Sistema,
  dsp: Dsp,
  posicao: Posicao,
  montagem: Montagem,
  orca: Orca,
  comparar: Comparar,
};

function EquipHeader() {
  const wooferPreset = useStore((s) => s.wooferPreset);
  const driverPreset = useStore((s) => s.driverPreset);
  const cabinetType = useStore((s) => s.cabinetType);
  const subCfg = useStore((s) => s.subCfg);
  const speakers = useStore((s) => s.layout.speakers);
  const c = { main: 0, fill: 0, sub: 0 };
  for (const s of speakers) c[s.kind]++;
  const chip = (label: string, value: string) => (
    <span className="equip-chip"><span className="ek">{label}</span>{value}</span>
  );
  return (
    <div className="equip" aria-label="equipamentos selecionados">
      {chip('Woofer', wooferPreset || 'custom')}
      {chip('Driver', driverPreset || 'custom')}
      {chip('Caixa', cabinetType === 'sealed' ? 'Selado' : 'Bass-reflex')}
      {chip('Sub', subCfg === 'card' ? 'cardioid' : subCfg === 'sym' ? 'simétrico' : 'end-fire')}
      {chip('No mapa', `${c.main} main · ${c.fill} fill · ${c.sub} sub`)}
    </div>
  );
}

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
  const setTab = useStore((s) => s.setTab);
  const reset = useStore((s) => s.reset);
  const [shared, setShared] = useState(false);

  // Fall back to the landing tab if a previously-persisted tab is no longer in the simplified nav.
  const effectiveTab = TABS.some((t) => t.id === activeTab) ? activeTab : 'montar';
  const Panel = PANELS[effectiveTab];

  const share = async () => {
    const cfg = configOf(useStore.getState());
    const url = buildShareUrl(cfg);
    writeHash(cfg);
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      setShared(false);
    }
  };

  return (
    <>
      <header className="hdr">
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <circle cx="13" cy="13" r="10" fill="none" stroke="#c8a96e" strokeWidth="1.2" />
          <circle cx="13" cy="13" r="3.5" fill="none" stroke="#c8a96e" strokeWidth="1.2" />
          <circle cx="13" cy="13" r="1.1" fill="#c8a96e" />
          <line x1="13" y1="3" x2="13" y2="7.5" stroke="#c8a96e" strokeWidth="1" />
          <line x1="13" y1="18.5" x2="13" y2="23" stroke="#c8a96e" strokeWidth="1" />
          <line x1="3" y1="13" x2="7.5" y2="13" stroke="#c8a96e" strokeWidth="1" />
          <line x1="18.5" y1="13" x2="23" y2="13" stroke="#c8a96e" strokeWidth="1" />
        </svg>
        <div>
          <div className="ltx">SOUNDBOX</div>
          <div className="lsb">Speaker &amp; Room Designer</div>
        </div>
        <div className="hdr-actions">
          <button className="btn" onClick={share}>{shared ? 'link copiado' : 'compartilhar'}</button>
          <button className="btn" onClick={() => window.print()}>PDF</button>
          <button className="btn" onClick={() => { if (confirm('Restaurar a configuração padrão do relatório?')) reset(); }}>reset</button>
        </div>
      </header>

      <TabNav active={effectiveTab} onChange={setTab} />
      <EquipHeader />

      <main className="body">
        <div role="tabpanel" id={`panel-${effectiveTab}`} aria-labelledby={`tab-${effectiveTab}`}>
          <Panel />
        </div>
      </main>
    </>
  );
}
