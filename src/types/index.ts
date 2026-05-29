// Domain types for SoundBox — speaker & room designer.

export type CabinetType = 'sealed' | 'br';
export type SubConfig = 'card' | 'sym' | 'ef';
export type Severity = 'error' | 'warn' | 'ok' | 'info' | 'gold';

export type TabId =
  | 'montar'
  | 'resumo'
  | 'sala'
  | 'woofer'
  | 'driver'
  | 'sub'
  | 'gabinete'
  | 'sistema'
  | 'dsp'
  | 'posicao'
  | 'montagem'
  | 'orca'
  | 'comparar';

export interface WooferParams {
  fs: number;
  qts: number;
  qes: number;
  qms: number;
  vas: number;
  xmax: number;
  spl: number;
  pw: number;
}

export interface DriverParams {
  spl: number;
  pw: number;
  fmin: number;
  xo: number;
  imp: number;
  cov: number;
}

export interface WooferPreset extends WooferParams {
  nm: string;
  nd: string;
  nt: string;
  rec: boolean;
  preco: number; // per-unit BRL
}

export interface HfDriverPreset extends DriverParams {
  nm: string;
  nd: string;
  nt: string;
  rec: boolean;
  preco: number; // per-unit BRL
}

export interface SubPreset {
  nm: string;
  nd: string;
  nt: string;
  preco: number; // per-unit BRL
  rec: boolean;
}

export interface RoomTreatments {
  bassTraps: boolean;
  panels: boolean;
  ceiling: boolean;
  diffuser: boolean;
}

export interface FillSpeaker {
  label: string;
  distanceCm: number;
}

/** The full serializable configuration — persisted to localStorage and shareable via URL. */
export interface Config {
  length: number;
  width: number;
  height: number;
  rt60Target: number; // ms
  treatments: RoomTreatments;

  woofer: WooferParams;
  wooferPreset: string; // preset name, '' if custom

  driver: DriverParams;
  driverPreset: string;

  cabinetType: CabinetType;
  targetQtc: number;
  volumeL: number;
  useCustomVolume: boolean;

  subFc: number;
  subCfg: SubConfig;

  splTarget: number;
  distance: number;
  fills: FillSpeaker[];
}

export interface AxialMode {
  n: number;
  f: number;
  axis: 'L' | 'W' | 'H';
}

export type SpeakerKind = 'main' | 'fill' | 'sub';

export interface Speaker {
  id: string;
  kind: SpeakerKind;
  x: number; // fraction 0..1 of room length (horizontal)
  y: number; // fraction 0..1 of room depth (vertical)
  aimDeg: number; // pointing direction in meters space (atan2(dy,dx), degrees)
}

export interface VenueLayout {
  speakers: Speaker[];
}

/** All derived/computed values — never stored, recomputed from Config. */
export interface Derived {
  volume: number; // m3
  surface: number; // m2
  rt60: number; // s, bare room
  rt60Treated: number; // s, with treatment
  rt60ms: number; // bare, ms
  schroeder: number; // Hz
  modes: AxialMode[];

  ebp: number;
  wooferMaxSpl: number;
  driverMaxSpl: number;
  hfSafe: boolean;

  vbSuggested: number; // L, from targetQtc
  vb: number; // effective L
  qtc: number;
  fc: number;
  f3: number;
  dims: {
    internal: { w: number; h: number; d: number };
    external: { w: number; h: number; d: number };
    mdfAreaPair: number;
  };

  splAtDistance: number; // max SPL at listening distance
  headroom: number;
  wattsNeeded: number;
  score: number;
}

export interface Alert {
  id: string;
  group: TabId;
  severity: Severity;
  title: string;
  detail?: string;
}

export interface BudgetItem {
  category: string;
  name: string;
  description: string;
  price: number; // line total (qty included)
  saving?: number; // economy only; 0 = unchanged
}

export interface Vendor {
  products: string;
  stores: string;
}
