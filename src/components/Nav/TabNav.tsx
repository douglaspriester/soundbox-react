import { useRef } from 'react';
import type { TabId } from '../../types';
import { TABS } from '../../appTabs';

export function TabNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const navRef = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = TABS.findIndex((t) => t.id === active);
    const next = e.key === 'ArrowRight' ? (idx + 1) % TABS.length : (idx - 1 + TABS.length) % TABS.length;
    onChange(TABS[next].id);
  };

  return (
    <div className="nav" role="tablist" aria-label="Seções" ref={navRef} onKeyDown={onKey}>
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={active === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={active === t.id ? 0 : -1}
          className="tb"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
