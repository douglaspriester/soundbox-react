// Canvas drawing tokens. Mirrors the CSS custom properties in index.css so
// charts and DOM read from one palette (the warm-gold / near-black identity).
// Single source of truth for hand-drawn Canvas 2D colors.

export const TOKENS = {
  bg: '#070707',
  canvas: '#0a0a0a',
  surface: '#111111',
  surface2: '#1a1a1a',
  surface3: '#222222',

  gold: '#c8a96e',
  goldSoft: '#e4c98a',
  goldDim: 'rgba(200,169,110,.5)',
  goldWash: 'rgba(200,169,110,.12)',

  text: '#efefef',
  text2: '#a0a0a0',
  text3: '#8a8a8a',
  text4: '#6b6b6b',

  grid: 'rgba(255,255,255,.07)',
  gridStrong: 'rgba(255,255,255,.13)',

  // semantic — bright text / mid chart-stroke / wash fill
  ok: '#86efac',
  okStroke: '#4ade80',
  okFill: 'rgba(74,222,128,.12)',
  warn: '#fcd34d',
  warnStroke: '#fbbf24',
  warnFill: 'rgba(251,191,36,.12)',
  error: '#fca5a5',
  errorStroke: '#f87171',
  errorFill: 'rgba(248,113,113,.12)',
  info: '#93c5fd',
  infoStroke: '#60a5fa',
  infoFill: 'rgba(96,165,250,.12)',
  violet: 'rgba(167,139,250,.7)',
} as const;

export type Tokens = typeof TOKENS;
