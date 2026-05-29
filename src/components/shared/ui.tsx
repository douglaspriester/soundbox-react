import type { ReactNode } from 'react';
import type { Alert as AlertT, Severity } from '../../types';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="card">
      {title && <div className="ct">{title}</div>}
      {children}
    </div>
  );
}

export function SummaryCard({ children }: { children: ReactNode }) {
  return (
    <div className="sc">
      <div className="stl">em linguagem simples</div>
      <div className="stx">{children}</div>
    </div>
  );
}

export function Alert({ severity, title, detail }: { severity: Severity; title: string; detail?: string }) {
  return (
    <div className={`al ${severity}`}>
      <div className="at">{title}</div>
      {detail && <div className="ad">{detail}</div>}
    </div>
  );
}

export function AlertList({ alerts }: { alerts: AlertT[] }) {
  if (alerts.length === 0) return null;
  return (
    <>
      {alerts.map((a) => (
        <Alert key={a.id} severity={a.severity} title={a.title} detail={a.detail} />
      ))}
    </>
  );
}

export function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="sr">
      <span className="sk">{label}</span>
      <span className="sv">{value}</span>
    </div>
  );
}

export function MetricTile({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="mt">
      <div className="mv">{value}</div>
      <div className="ml">{label}</div>
      {sub && <div className="ms">{sub}</div>}
    </div>
  );
}

export function Divider() {
  return <div className="div" />;
}

export function StepRow({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="step-row">
      <div className="step-num">{n}</div>
      <div>
        <div className="step-title">{title}</div>
        <div className="step-desc">{children}</div>
      </div>
    </div>
  );
}

export function SubTabs<T extends string>({
  options,
  active,
  onChange,
  ariaLabel = 'Opções de visualização',
}: {
  options: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="swnav" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={active === o.id}
          className="stab"
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
