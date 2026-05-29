import type { BudgetItem, Vendor } from '../types';

// Full system budget (v4 C array). Prices are LINE TOTALS (qty included).
// Verified total: R$ 63.380.
export const FULL_BUDGET: BudgetItem[] = [
  { category: 'Toca-discos', name: 'Technics SL-1200MK3D (par)', description: 'Já no setup', price: 9800 },
  { category: 'Mixer', name: 'Rane 72 MKII', description: 'Phono stage audiophile', price: 7800 },
  { category: 'Mains', name: 'B&C 12CL76 × 2', description: 'Woofer mains', price: 4100 },
  { category: 'Mains', name: 'B&C DE180 × 2', description: 'Driver HF', price: 2250 },
  { category: 'Mains', name: 'Waveguide elíptico × 2', description: '90° cobertura', price: 1400 },
  { category: 'Mains', name: 'Gabinete MDF × 2', description: 'Materiais selado ~40L', price: 1600 },
  { category: 'Mains', name: 'Acabamento burl + laca 2K', description: 'Look dos renders', price: 950 },
  { category: 'Sub', name: 'RCF SUB 8004-AS II × 2', description: '18" ativo cardioid', price: 17800 },
  { category: 'Fills', name: 'JBL Control One × 4', description: 'Fills distribuídos — espalham o som (meio + fundo, E/D)', price: 2800 },
  { category: 'Amplificação', name: 'Crown XLS 1502 × 2', description: 'Amp mains LF + HF', price: 5800 },
  { category: 'Amplificação', name: 'Behringer EP2000', description: 'Amp fills', price: 950 },
  { category: 'DSP', name: 'miniDSP 2x4 HD', description: 'O maestro do sistema', price: 2200 },
  { category: 'Medição', name: 'UMIK-1 + REW', description: 'Calibração pós-instalação', price: 380 },
  { category: 'Acústica', name: 'Bass traps + painéis DIY', description: 'Tratamento da sala', price: 2800 },
  { category: 'Isolamento', name: 'Plataformas Technics DIY', description: 'Isolamento de vibração', price: 550 },
  { category: 'Cabos & Rack', name: 'Rack 12U + XLR + Speakon', description: 'Cabeamento e rack', price: 2200 },
];

// Economy build (Bar ZUM-ZUM v6 — cap R$ 50k · mains agora é ZUMZUM 01 sealed coaxial DIY).
// Filosofia: acústica é o maior investimento (R$ 15k), sub fica enxuto (R$ 2k),
// mains são caixas autorais DIY (ZUMZUM 01 sealed) com Eminence Beta-12CX coaxial.
// Listening bar = a SALA é o primeiro instrumento. Sub é coadjuvante.
export const ECONOMY_BUDGET: BudgetItem[] = [
  { category: 'Toca-discos', name: 'Technics SL-1200 MK3D × 2 (par usado)', description: '2 toca-discos profissionais — usados em bom estado, ~R$ 5k cada', price: 10000, saving: 0 },
  { category: 'Mixer', name: 'Allen & Heath Xone:23 ou Rane SL2', description: 'Mixer 2 canais com phono stage decente · upgrade futuro pra rotary Mastersounds Two V (~R$ 18k)', price: 5000, saving: 2800 },
  { category: 'Mains', name: 'ZUMZUM 01 × par · DIY sealed coaxial 12"', description: 'Caixas autorais: Eminence Beta-12CX (coaxial 12" · 99dB) + gabinete MDF 18mm selado 25-30L + tampo burl + frente fabric off-white + wall mount + plaquinha gravada. Build ~6 semanas. Ver ZUMZUM_01_planta_dimensional.md', price: 6880, saving: 3420 },
  { category: 'Sub', name: 'Sub passivo 15" DIY × 1', description: '1 sub para complementar o low-end (modesto · listening bar não é club). Pode dispensar inicialmente se ficar só MPB/jazz/soul', price: 2000, saving: 15800 },
  { category: 'Fills', name: 'JBL Control One × 2-3', description: 'Fills distribuídos no meio + fundo', price: 2000, saving: 800 },
  { category: 'Amplificação', name: 'Crown XLi 1500 × 1 + Crown XLi 800', description: 'Amp 2 canais pra mains + sub + fills', price: 6000, saving: 750 },
  { category: 'Acústica', name: 'Tratamento acústico profissional (bass traps + painéis + difusores + isolamento)', description: 'INVESTIMENTO PRINCIPAL — bass traps GIK ou equivalentes, painéis lã de rocha 700kg/m³ revestidos, difusores QRD no fundo, isolamento da porta. Listening bar = a sala é o primeiro instrumento', price: 15000, saving: 0 },
  { category: 'Extras DIY', name: 'Sobra R$ 3.120 pra calibração ou caixa #3', description: 'Mains DIY ficaram em R$ 6.880 (vs R$ 10k previstos). Sobra pra UMIK-1 + REW (R$ 380), 1 caixa extra reserva (R$ 3.440) ou contingência', price: 3120, saving: 0 },
];

export const VENDORS: Vendor[] = [
  { products: 'B&C, Faital', stores: 'sonorex.com.br · audiotek.com.br' },
  { products: 'Beyma', stores: 'selenebr.com.br' },
  { products: 'Crown, JBL, RCF', stores: 'musiccenter.com.br · somlivre.com.br' },
  { products: 'Yamaha DXS', stores: 'yamahapro.com.br · musical.com.br' },
  { products: 'miniDSP', stores: 'minidsp.com (importação ~30 dias)' },
  { products: 'Burl veneer', stores: 'Madeirão · marcenarias SP/RJ' },
  { products: 'Lã de rocha', stores: 'Isover / Knauf' },
  { products: 'UMIK-1', stores: 'minidsp.com ou Amazon importado' },
];

export function sumBudget(items: BudgetItem[]): number {
  return items.reduce((acc, i) => acc + i.price, 0);
}

export function sumSavings(items: BudgetItem[]): number {
  return items.reduce((acc, i) => acc + (i.saving ?? 0), 0);
}
