import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { Config } from '../types';
import { DEFAULT_CONFIG } from './useStore';

const HASH_PREFIX = '#c=';

export function encodeConfig(c: Config): string {
  return compressToEncodedURIComponent(JSON.stringify(c));
}

export function decodeConfig(payload: string): Config | null {
  try {
    const json = decompressFromEncodedURIComponent(payload);
    if (!json) return null;
    const parsed = JSON.parse(json) as Partial<Config>;
    // Merge over defaults so older/partial links still hydrate cleanly.
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      treatments: { ...DEFAULT_CONFIG.treatments, ...(parsed.treatments ?? {}) },
      woofer: { ...DEFAULT_CONFIG.woofer, ...(parsed.woofer ?? {}) },
      driver: { ...DEFAULT_CONFIG.driver, ...(parsed.driver ?? {}) },
      fills: parsed.fills ?? DEFAULT_CONFIG.fills,
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(c: Config): string {
  return `${location.origin}${location.pathname}${HASH_PREFIX}${encodeConfig(c)}`;
}

/** Read a config from the current URL hash, if present (hash = explicit intent). */
export function readHashConfig(): Config | null {
  if (!location.hash.startsWith(HASH_PREFIX)) return null;
  return decodeConfig(location.hash.slice(HASH_PREFIX.length));
}

export function writeHash(c: Config): void {
  history.replaceState(null, '', `${HASH_PREFIX}${encodeConfig(c)}`);
}
