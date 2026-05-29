import { useId } from 'react';

export function SliderField({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  decimals = 1,
}: {
  label: string;
  value: number;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  decimals?: number;
}) {
  const id = useId();
  return (
    <div className="slw">
      <label htmlFor={id}>
        {label}
        <span>
          {value.toFixed(decimals)}
          {unit ? ` ${unit}` : ''}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export function NumberField({
  label,
  value,
  step,
  min,
  max,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        value={value}
        step={step ?? 1}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
      />
      {hint && <div className="u">{hint}</div>}
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PresetButton({
  name,
  desc,
  spec,
  selected,
  recommended,
  onClick,
}: {
  name: string;
  desc: string;
  spec: string;
  selected: boolean;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="pbtn" aria-pressed={selected} onClick={onClick}>
      <div className="pn">
        {name}
        {recommended && <span className="gold-tag">relatório</span>}
      </div>
      <div className="pd">{desc}</div>
      <div className="ps">{spec}</div>
    </button>
  );
}
