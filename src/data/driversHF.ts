import type { HfDriverPreset } from '../types';

// Source of truth: soundbox v4 HF_PST array (per-unit prices from the technical report).
export const HF_DRIVERS: HfDriverPreset[] = [
  {
    nm: 'B&C DE180',
    nd: '1" — escolha do relatório',
    nt: '107dB · fmin 800Hz · cobertura 90° · R$1.125/un',
    spl: 107, pw: 60, fmin: 800, xo: 1500, imp: 8, cov: 90,
    rec: true, preco: 1125,
  },
  {
    nm: 'B&C DE250',
    nd: '1" — mais potência',
    nt: '109dB · fmin 1000Hz · 90° · R$1.350/un',
    spl: 109, pw: 80, fmin: 1000, xo: 1800, imp: 8, cov: 90,
    rec: false, preco: 1350,
  },
  {
    nm: 'Faital Pro HF108',
    nd: '1" — cobertura larga 100°',
    nt: '111dB · fmin 700Hz · 100° · R$1.600/un',
    spl: 111, pw: 80, fmin: 700, xo: 1200, imp: 8, cov: 100,
    rec: false, preco: 1600,
  },
  {
    nm: 'BMS 4540ND',
    nd: '1.5" — crossover baixo possível',
    nt: '112dB · fmin 600Hz · 90° · R$2.200/un',
    spl: 112, pw: 100, fmin: 600, xo: 1000, imp: 8, cov: 90,
    rec: false, preco: 2200,
  },
  {
    nm: 'Selenium D250X',
    nd: '1" — econômico nacional',
    nt: '108dB · fmin 1000Hz · 80° · R$480/un',
    spl: 108, pw: 60, fmin: 1000, xo: 1800, imp: 8, cov: 80,
    rec: false, preco: 480,
  },
];
