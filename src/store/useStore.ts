import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Config, DriverParams, RoomTreatments, TabId, WooferParams, FillSpeaker, VenueLayout } from '../types';
import { WOOFERS } from '../data/woofers';
import { HF_DRIVERS } from '../data/driversHF';
import { DEFAULT_FILLS } from '../data/fills';
import { SYSTEMS } from '../data/systems';

function wooferOf(nm: string): WooferParams {
  const p = WOOFERS.find((x) => x.nm === nm) ?? WOOFERS[0];
  return { fs: p.fs, qts: p.qts, qes: p.qes, qms: p.qms, vas: p.vas, xmax: p.xmax, spl: p.spl, pw: p.pw };
}
function driverOf(nm: string): DriverParams {
  const p = HF_DRIVERS.find((x) => x.nm === nm) ?? HF_DRIVERS[0];
  return { spl: p.spl, pw: p.pw, fmin: p.fmin, xo: p.xo, imp: p.imp, cov: p.cov };
}

export const DEFAULT_CONFIG: Config = {
  length: 15,
  width: 4.5,
  height: 6,
  rt60Target: 400,
  treatments: { bassTraps: false, panels: false, ceiling: false, diffuser: false },
  woofer: wooferOf('B&C 12CL76'),
  wooferPreset: 'B&C 12CL76',
  driver: driverOf('Faital Pro HF108'),
  driverPreset: 'Faital Pro HF108',
  cabinetType: 'sealed',
  targetQtc: 0.5,
  volumeL: 42,
  useCustomVolume: false,
  subFc: 80,
  subCfg: 'card',
  splTarget: 80,
  distance: 4,
  fills: DEFAULT_FILLS,
};

// Top-down install positions (fractions of the room) for the interactive plan.
// aimDeg in meters space; mains toed-in toward the audience centroid, fills/sub point down.
export const DEFAULT_LAYOUT: VenueLayout = {
  speakers: [
    { id: 'main-1', kind: 'main', x: 0.37, y: 0.13, aimDeg: 66 },
    { id: 'main-2', kind: 'main', x: 0.63, y: 0.13, aimDeg: 114 },
    { id: 'sub-1', kind: 'sub', x: 0.5, y: 0.35, aimDeg: 90 },
    { id: 'fill-1', kind: 'fill', x: 0.12, y: 0.5, aimDeg: 90 },
    { id: 'fill-2', kind: 'fill', x: 0.88, y: 0.5, aimDeg: 90 },
    { id: 'fill-3', kind: 'fill', x: 0.12, y: 0.74, aimDeg: 90 },
    { id: 'fill-4', kind: 'fill', x: 0.88, y: 0.74, aimDeg: 90 },
  ],
};

let speakerSeq = 100;
const nextId = (kind: string) => `${kind}-${speakerSeq++}`;

interface StoreState extends Config {
  activeTab: TabId;
  snapshotB: Config | null;
  layout: VenueLayout;
  selectedSystem: string;

  setTab: (t: TabId) => void;
  setRoom: (patch: Partial<Pick<Config, 'length' | 'width' | 'height'>>) => void;
  toggleTreatment: (k: keyof RoomTreatments) => void;
  setWoofer: (patch: Partial<WooferParams>) => void;
  applyWoofer: (nm: string) => void;
  setDriver: (patch: Partial<DriverParams>) => void;
  applyDriver: (nm: string) => void;
  applySystem: (id: string) => void;
  setCabinet: (patch: Partial<Pick<Config, 'cabinetType' | 'targetQtc' | 'volumeL' | 'useCustomVolume'>>) => void;
  setSub: (patch: Partial<Pick<Config, 'subFc' | 'subCfg'>>) => void;
  setSystem: (patch: Partial<Pick<Config, 'splTarget' | 'distance'>>) => void;
  setFill: (index: number, distanceCm: number) => void;

  loadConfig: (c: Config) => void;
  reset: () => void;
  saveToB: () => void;
  clearB: () => void;
  moveSpeaker: (id: string, x: number, y: number) => void;
  rotateSpeaker: (id: string, aimDeg: number) => void;
  addSpeaker: (kind: 'main' | 'fill' | 'sub') => void;
  removeSpeaker: (id: string) => void;
  resetLayout: () => void;
}

function configOf(s: Config): Config {
  return {
    length: s.length, width: s.width, height: s.height, rt60Target: s.rt60Target,
    treatments: { ...s.treatments },
    woofer: { ...s.woofer }, wooferPreset: s.wooferPreset,
    driver: { ...s.driver }, driverPreset: s.driverPreset,
    cabinetType: s.cabinetType, targetQtc: s.targetQtc, volumeL: s.volumeL, useCustomVolume: s.useCustomVolume,
    subFc: s.subFc, subCfg: s.subCfg,
    splTarget: s.splTarget, distance: s.distance, fills: s.fills.map((x) => ({ ...x })),
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIG,
      activeTab: 'montar',
      snapshotB: null,
      layout: DEFAULT_LAYOUT,
      selectedSystem: 'listening',

      setTab: (t) => set({ activeTab: t }),
      setRoom: (patch) => set(patch),
      toggleTreatment: (k) =>
        set((s) => ({ treatments: { ...s.treatments, [k]: !s.treatments[k] } })),
      setWoofer: (patch) => set((s) => ({ woofer: { ...s.woofer, ...patch }, wooferPreset: '' })),
      applyWoofer: (nm) => set({ woofer: wooferOf(nm), wooferPreset: nm, useCustomVolume: false }),
      setDriver: (patch) => set((s) => ({ driver: { ...s.driver, ...patch }, driverPreset: '' })),
      applyDriver: (nm) => set({ driver: driverOf(nm), driverPreset: nm }),
      applySystem: (id) =>
        set(() => {
          const sys = SYSTEMS.find((x) => x.id === id) ?? SYSTEMS[1];
          return {
            woofer: { ...sys.woofer }, wooferPreset: sys.wooferName,
            driver: { ...sys.driver }, driverPreset: sys.driverName,
            cabinetType: sys.cabinetType, targetQtc: sys.targetQtc, useCustomVolume: false,
            selectedSystem: sys.id,
          };
        }),
      setCabinet: (patch) => set(patch),
      setSub: (patch) => set(patch),
      setSystem: (patch) => set(patch),
      setFill: (index, distanceCm) =>
        set((s) => ({ fills: s.fills.map((fseg, i) => (i === index ? { ...fseg, distanceCm } : fseg)) })),

      loadConfig: (c) => set({ ...c }),
      reset: () => set({ ...DEFAULT_CONFIG, layout: DEFAULT_LAYOUT, selectedSystem: 'listening' }),
      saveToB: () => set((s) => ({ snapshotB: configOf(s) })),
      clearB: () => set({ snapshotB: null }),
      moveSpeaker: (id, x, y) =>
        set((s) => ({ layout: { speakers: s.layout.speakers.map((sp) => (sp.id === id ? { ...sp, x, y } : sp)) } })),
      rotateSpeaker: (id, aimDeg) =>
        set((s) => ({ layout: { speakers: s.layout.speakers.map((sp) => (sp.id === id ? { ...sp, aimDeg } : sp)) } })),
      addSpeaker: (kind) =>
        set((s) => ({
          layout: { speakers: [...s.layout.speakers, { id: nextId(kind), kind, x: 0.5, y: 0.5, aimDeg: 90 }] },
        })),
      removeSpeaker: (id) =>
        set((s) => ({ layout: { speakers: s.layout.speakers.filter((sp) => sp.id !== id) } })),
      resetLayout: () => set({ layout: DEFAULT_LAYOUT }),
    }),
    {
      name: 'soundbox:v1',
      version: 2,
      migrate: (persisted, version) => {
        const p = persisted as { layout?: unknown };
        // The layout shape changed in v2 (object → speakers array); reset it.
        if (version < 2 && p) p.layout = DEFAULT_LAYOUT;
        return p;
      },
      partialize: (s) => ({ ...configOf(s), activeTab: s.activeTab, snapshotB: s.snapshotB, layout: s.layout, selectedSystem: s.selectedSystem }),
    },
  ),
);

export { configOf };
export type { FillSpeaker };
