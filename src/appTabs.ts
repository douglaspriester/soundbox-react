import type { TabId } from './types';

// Simplified nav: the core flow is pick a system → see the map → details + budget.
export const TABS: { id: TabId; label: string }[] = [
  { id: 'montar', label: 'Montar' },
  { id: 'sala', label: 'Sala' },
  { id: 'orca', label: 'Orçamento' },
  { id: 'comparar', label: 'Comparar A/B' },
];
