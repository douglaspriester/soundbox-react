import type { CabinetType, DriverParams, WooferParams } from '../types';

// Three curated builds for the Bar Rio — my best picks for a vinyl listening bar
// (groove/soul, long sessions, low fatigue). Each drives the coverage map:
// main level = woofer sensitivity + power, coverage angle = driver waveguide.
export interface SystemOption {
  id: string;
  tier: string;
  name: string;
  blurb: string;
  pricePerCab: number;
  wooferName: string;
  woofer: WooferParams;
  driverName: string;
  driver: DriverParams;
  cabinetType: CabinetType;
  targetQtc: number;
  links: { label: string; url: string; note?: string }[];
}

export const SYSTEMS: SystemOption[] = [
  {
    id: 'nacional',
    tier: 'Custo-benefício',
    name: 'Groove Nacional',
    blurb: 'Tudo nacional (Selenium), fácil de achar e assistência aqui. Joga a economia no tratamento da sala.',
    pricePerCab: 1355,
    wooferName: 'Selenium 12MB3P',
    woofer: { fs: 50, qts: 0.36, qes: 0.40, qms: 4.0, vas: 58, xmax: 6, spl: 97, pw: 350 },
    driverName: 'Selenium D220Ti',
    driver: { spl: 108, pw: 60, fmin: 1200, xo: 1800, imp: 8, cov: 90 },
    cabinetType: 'sealed',
    targetQtc: 0.5,
    links: [
      { label: 'Woofer Selenium 12" (MercadoLivre)', url: 'https://lista.mercadolivre.com.br/alto-falante-selenium-12-500w-rms' },
      { label: 'Driver D220Ti — CMK (R$255)', url: 'https://www.cmkvirtual.com.br/produto/driver-titanium-d220ti-selenium' },
      { label: 'Corneta HL 11-25 (R$84)', url: 'https://www.shoppratico.com.br/produtos/cone-corneta-aluminio-jbl-selenium-hl11-25-hl1125neq25asb/' },
    ],
  },
  {
    id: 'listening',
    tier: 'Recomendado',
    name: 'Listening Bar',
    blurb: 'Médio limpo do B&C + agudo suave e largo (100°) do Faital. O equilíbrio certo pra ouvir vinil a noite toda.',
    pricePerCab: 2800,
    wooferName: 'B&C 12CL76',
    woofer: { fs: 48, qts: 0.31, qes: 0.34, qms: 4.5, vas: 68, xmax: 7, spl: 98, pw: 400 },
    driverName: 'Faital Pro HF108',
    driver: { spl: 111, pw: 80, fmin: 700, xo: 1200, imp: 8, cov: 100 },
    cabinetType: 'sealed',
    targetQtc: 0.5,
    links: [
      { label: 'B&C 12CL76 — specs/distribuidor BR', url: 'https://www.bcspeakers.com/en/products/lf-driver/12/8/12CL76', note: 'import via distribuidor B&C BR' },
      { label: 'Faital HF108 (Parts Express)', url: 'https://www.parts-express.com/FaitalPRO-HF108-1-Neodymium-Compression-Horn-Driver-8-Ohm-2-3-Bolt-294-1055', note: 'import; alternativa BR: Faital HF110 ~R$1.253 na AMERCO' },
    ],
  },
  {
    id: 'referencia',
    tier: 'Referência',
    name: 'Soul de Papel',
    blurb: 'Cone de papel (médio orgânico) + driver 1.4" cruzando baixo: o agudo mais relaxado e sem fadiga. O topo.',
    pricePerCab: 4000,
    wooferName: 'Faital 12PR320',
    woofer: { fs: 45, qts: 0.30, qes: 0.33, qms: 5.0, vas: 75, xmax: 6.5, spl: 97, pw: 400 },
    driverName: 'B&C DE500 (1.4")',
    driver: { spl: 110, pw: 80, fmin: 600, xo: 1000, imp: 8, cov: 90 },
    cabinetType: 'sealed',
    targetQtc: 0.5,
    links: [
      { label: 'Faital 12PR320 — AMERCO (R$2.320)', url: 'https://loja.amercobrasil.com.br/alto-falante/neodimio/12-polegadas/alto-falante-12-polegadas-neodimio-freq-45-5000-hz-300w-aes97-db-12pr320-faitalpro', note: 'sob encomenda' },
      { label: 'B&C DE500 (Parts Express)', url: 'https://www.parts-express.com/B-C-DE500-8-1-Neo-Titanium-Horn-Driver-8-Ohm-2-3-Bolt-294-608', note: 'import / legado — ou peça DE550 atual' },
    ],
  },
];
