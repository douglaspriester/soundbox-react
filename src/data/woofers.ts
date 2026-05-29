import type { WooferPreset } from '../types';

// Source of truth: soundbox v4 PST array (per-unit prices from the technical report).
export const WOOFERS: WooferPreset[] = [
  {
    nm: 'B&C 12CL76',
    nd: '12" pro — escolha do relatório',
    nt: 'Fs 48Hz · Qts 0.31 · 98dB · R$2.050/un',
    fs: 48, qts: 0.31, qes: 0.34, qms: 4.5, vas: 68, xmax: 7, spl: 98, pw: 400,
    rec: true, preco: 2050,
  },
  {
    nm: 'Faital Pro 12FH500',
    nd: '12" — grave começa mais cedo',
    nt: 'Fs 42Hz · Qts 0.33 · 97dB · R$1.950/un',
    fs: 42, qts: 0.33, qes: 0.37, qms: 4.2, vas: 80, xmax: 8.5, spl: 97, pw: 350,
    rec: false, preco: 1950,
  },
  {
    nm: 'Eminence 3015LF',
    nd: '15" — Vas enorme, caixa grande',
    nt: 'Fs 32Hz · Qts 0.28 · 95dB · R$1.600/un',
    fs: 32, qts: 0.28, qes: 0.31, qms: 4.8, vas: 230, xmax: 9.7, spl: 95, pw: 450,
    rec: false, preco: 1600,
  },
  {
    nm: 'Beyma 12P80Fe',
    nd: '12" — econômico, 99dB',
    nt: 'Fs 52Hz · Qts 0.35 · 99dB · R$850/un',
    fs: 52, qts: 0.35, qes: 0.39, qms: 4.0, vas: 58, xmax: 6, spl: 99, pw: 400,
    rec: false, preco: 850,
  },
  {
    nm: 'B&C 15SW115',
    nd: '15" — sub-grave dedicado',
    nt: 'Fs 28Hz · Qts 0.28 · 98dB · R$2.400/un',
    fs: 28, qts: 0.28, qes: 0.30, qms: 4.9, vas: 180, xmax: 12, spl: 98, pw: 600,
    rec: false, preco: 2400,
  },
];
