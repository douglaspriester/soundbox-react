import { useMemo } from 'react';
import { useStore, configOf } from '../store/useStore';
import { derive } from '../physics/derive';

/** Single source of model state: the store handle, the serializable config, and all derived values. */
export function useModel() {
  const s = useStore();
  const config = useMemo(() => configOf(s), [s]);
  const derived = useMemo(() => derive(config), [config]);
  return { s, config, derived };
}
