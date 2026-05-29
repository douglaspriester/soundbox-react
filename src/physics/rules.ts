import type { Alert, Config, Derived, TabId } from '../types';

interface Ctx {
  c: Config;
  d: Derived;
}

interface Rule {
  id: string;
  group: TabId;
  when: (x: Ctx) => boolean;
  severity: Alert['severity'];
  title: (x: Ctx) => string;
  detail?: (x: Ctx) => string;
}

const f = (n: number, d = 0) => n.toFixed(d);

// Thresholds reconciled to the report where code/report diverged in v4.
const RULES: Rule[] = [
  // --- Sala ---
  {
    id: 'rt60.high', group: 'sala',
    when: ({ d }) => d.rt60ms > 600,
    severity: 'error',
    title: ({ d }) => `RT60 ~${f(d.rt60ms)}ms — tratamento acústico necessário`,
    detail: () => 'Tijolo e concreto sem absorção. Alvo: 350–450ms. Ative o tratamento na aba Sala para simular.',
  },
  {
    id: 'rt60.treated.ok', group: 'sala',
    when: ({ c, d }) => (c.treatments.bassTraps || c.treatments.panels) && d.rt60Treated * 1000 <= 600,
    severity: 'ok',
    title: ({ d }) => `Com tratamento: RT60 ~${f(d.rt60Treated * 1000)}ms`,
    detail: () => 'Decaimento dentro do aceitável para um bar de vinil.',
  },
  {
    id: 'schroeder', group: 'sala',
    when: () => true,
    severity: 'info',
    title: ({ d }) => `Crossover sub/main deve ser ≥ ${f(d.schroeder)}Hz (Schroeder)`,
    detail: () => 'Abaixo dessa frequência a sala domina por modos, não por reflexões difusas.',
  },
  {
    id: 'modes.axial', group: 'sala',
    when: ({ d }) => d.modes.some((m) => m.axis === 'L' && m.f < 120),
    severity: 'warn',
    title: ({ d }) =>
      `Modos axiais críticos: ${d.modes.filter((m) => m.axis === 'L' && m.f < 120).map((m) => f(m.f)).join(', ')}Hz`,
    detail: () => 'Posicione o sub a L/4 da parede para minimizar o modo fundamental.',
  },

  // --- Woofer ---
  {
    id: 'qts.sealed', group: 'woofer',
    when: ({ c }) => c.woofer.qts < 0.35,
    severity: 'ok',
    title: () => 'Qts baixo — ideal para gabinete selado',
    detail: ({ c }) => `Qts ${c.woofer.qts} favorece grave firme e rápido (groove).`,
  },
  {
    id: 'qts.high', group: 'woofer',
    when: ({ c }) => c.woofer.qts >= 0.35,
    severity: 'warn',
    title: () => 'Qts alto — monitorar Qtc do gabinete (≤ 0.85)',
  },
  {
    id: 'fs.high', group: 'woofer',
    when: ({ c }) => c.woofer.fs > 50,
    severity: 'warn',
    title: ({ c }) => `Fs ${c.woofer.fs}Hz alto — sub precisa cobrir até ~100Hz`,
  },
  {
    id: 'ebp.reflex', group: 'woofer',
    when: ({ d }) => d.ebp > 100,
    severity: 'info',
    title: ({ d }) => `EBP ${f(d.ebp)} — considere bass-reflex em vez de selado`,
    detail: () => 'EBP > 100 indica um driver mais eficiente em caixa ventilada.',
  },

  // --- Gabinete ---
  {
    id: 'qtc.low', group: 'gabinete',
    when: ({ d }) => isFinite(d.qtc) && d.qtc < 0.6,
    severity: 'info',
    title: ({ d }) => `Qtc ${f(d.qtc, 2)} — levemente sub-amortecido (grave seco)`,
  },
  {
    id: 'qtc.high', group: 'gabinete',
    when: ({ d }) => d.qtc > 0.85,
    severity: 'warn',
    title: ({ d }) => `Qtc ${f(d.qtc, 2)} alto — gabinete pequeno demais, risco de distorção`,
  },
  {
    id: 'vb.small', group: 'gabinete',
    when: ({ d }) => d.vb < d.vbSuggested * 0.6,
    severity: 'error',
    title: () => 'Volume < 60% do sugerido — Qtc alto e grave comprimido',
  },
  {
    id: 'vb.big', group: 'gabinete',
    when: ({ d }) => d.vb > d.vbSuggested * 2.5,
    severity: 'error',
    title: () => 'Volume > 250% do sugerido — grave solto e lento',
  },

  // --- Driver HF ---
  {
    id: 'hf.safe', group: 'driver',
    when: ({ d }) => d.hfSafe,
    severity: 'ok',
    title: ({ c }) => `Crossover seguro — margem de ${c.driver.xo - c.driver.fmin}Hz acima do fmin`,
  },
  {
    id: 'hf.danger', group: 'driver',
    when: ({ d }) => !d.hfSafe,
    severity: 'error',
    title: ({ c }) => `PERIGO: crossover ${c.driver.xo}Hz abaixo do fmin ${c.driver.fmin}Hz — driver queima`,
  },
  {
    id: 'hf.limiter', group: 'driver',
    when: () => true,
    severity: 'info',
    title: () => 'Configure o limiter do driver HF em −3dB no miniDSP (obrigatório)',
  },

  // --- Sub ---
  {
    id: 'sub.card', group: 'sub',
    when: ({ c }) => c.subCfg === 'card',
    severity: 'ok',
    title: () => 'Cardioid stack correto — grave direcional, sem energia atrás',
  },
  {
    id: 'sub.sym', group: 'sub',
    when: ({ c }) => c.subCfg === 'sym',
    severity: 'error',
    title: () => 'Subs simétricos criam um nulo no centro da sala — use cardioid',
  },
  {
    id: 'sub.ef', group: 'sub',
    when: ({ c }) => c.subCfg === 'ef',
    severity: 'info',
    title: () => 'End-fire funciona, mas ocupa mais profundidade de chão',
  },
  {
    id: 'sub.booth', group: 'sub',
    when: () => true,
    severity: 'warn',
    title: () => 'NUNCA posicione os subs embaixo do booth (vibração nos Technics)',
  },

  // --- Sistema ---
  {
    id: 'headroom.low', group: 'sistema',
    when: ({ d }) => d.headroom < 6,
    severity: 'warn',
    title: ({ d }) => `Headroom ${f(d.headroom, 1)}dB insuficiente — pouca margem de pico`,
  },
  {
    id: 'headroom.ok', group: 'sistema',
    when: ({ d }) => d.headroom >= 12,
    severity: 'ok',
    title: ({ d }) => `Headroom ${f(d.headroom, 1)}dB excelente`,
  },
];

/** Evaluate all rules against the current config + derived state. */
export function evaluate(c: Config, d: Derived): Alert[] {
  const ctx: Ctx = { c, d };
  const out: Alert[] = [];
  for (const r of RULES) {
    if (r.when(ctx)) {
      out.push({ id: r.id, group: r.group, severity: r.severity, title: r.title(ctx), detail: r.detail?.(ctx) });
    }
  }
  return out;
}

export function alertsFor(group: TabId, c: Config, d: Derived): Alert[] {
  return evaluate(c, d).filter((a) => a.group === group);
}
