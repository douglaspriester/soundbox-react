import type { TabId } from './types';

export const TABS: { id: TabId; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'sala', label: 'Sala' },
  { id: 'woofer', label: 'Woofer' },
  { id: 'driver', label: 'Driver HF' },
  { id: 'sub', label: 'Sub' },
  { id: 'gabinete', label: 'Gabinete' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'dsp', label: 'DSP' },
  { id: 'posicao', label: 'Posição' },
  { id: 'montagem', label: 'Montagem' },
  { id: 'orca', label: 'Orçamento' },
  { id: 'comparar', label: 'Comparar A/B' },
];
