import type { SubPreset } from '../types';

// Subwoofer options surfaced in v4 (RCF + Yamaha from the report, plus the two
// extra options hardcoded in the v4 markup).
export const SUBS: SubPreset[] = [
  {
    nm: 'RCF SUB 8004-AS II',
    nd: '18" ativo — top pick do relatório',
    nt: '2200W · cardioid integrado · R$8.900/un',
    preco: 8900, rec: true,
  },
  {
    nm: 'Yamaha DXS18XLF',
    nd: '18" ativo — D-XSUB cardioid',
    nt: '1020W · econômico · R$6.800/un',
    preco: 6800, rec: false,
  },
  {
    nm: 'QSC KS118',
    nd: '18" ativo — SPL alto',
    nt: '3600W pico · cardioid card · R$9.500/un',
    preco: 9500, rec: false,
  },
  {
    nm: 'JBL SRX818SP',
    nd: '18" ativo — DSP integrado',
    nt: '1000W · preset cardioid · R$7.200/un',
    preco: 7200, rec: false,
  },
];
