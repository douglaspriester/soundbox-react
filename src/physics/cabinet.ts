// Cabinet geometry. Replicates v4's proportion heuristic (faithful look) with
// explicit units. Internal dims derived from volume; external adds wall thickness.

const WALL = 0.05; // total added across a dimension (2 × 25mm MDF walls), meters

export interface CabinetDims {
  internal: { w: number; h: number; d: number };
  external: { w: number; h: number; d: number };
  mdfAreaPair: number; // m² of MDF for a matched pair
}

export function cabinetDims(vbLiters: number): CabinetDims {
  const vb = Math.max(vbLiters, 0.5);
  const s = Math.cbrt(vb * 1.2) / 10; // meters (vb in L ≈ dm³)
  const wi = s * 0.88;
  const hi = s * 1.28;
  const di = s * 0.82;
  const we = wi + WALL;
  const he = hi + WALL;
  const de = di + WALL;
  const oneBox = 2 * (we * he + we * de + he * de);
  return {
    internal: { w: wi, h: hi, d: di },
    external: { w: we, h: he, d: de },
    mdfAreaPair: oneBox * 2,
  };
}
