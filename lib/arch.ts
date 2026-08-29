/**
 * The house motif: a multifoil (cusped) Mughal arch, generated rather
 * than hand-drawn. A multifoil arch is a two-centred pointed arch whose
 * opening is then scalloped into lobes, and nine lobes hand-tuned as
 * Béziers is a losing game — the cusps come out uneven and flatten at
 * small sizes. Sampling the guide curve and hanging a semicircle off each
 * chord gets them identical by construction, and makes the lobe count a
 * number we can tune.
 *
 * Shared so the hero's photo bays, the preloader's ornament and the
 * collections arcade are the same shape by construction and can never
 * drift apart.
 */
export const ARCH_W = 300;
export const ARCH_H = 480;

/**
 * Sample the guide curve, left springing point → apex → right springing
 * point. Every outline in the house comes off these points, which is what
 * keeps the lobes identical between shapes.
 */
function archPoints(lobes: number): [number, number][] {
  // Two-centred pointed arch: each half is an arc of radius 0.75W struck
  // from the opposite springing point. That puts the apex at 0.7071W.
  const r = 0.75 * ARCH_W;
  const spring = 0.7071 * ARCH_W;
  const tMax = Math.acos(1 / 3); // where the two arcs cross, at x = W/2
  const half = Math.ceil(lobes / 2);

  const left: [number, number][] = [];
  for (let i = 0; i <= half; i++) {
    const t = (i / half) * tMax;
    left.push([r - r * Math.cos(t), spring - r * Math.sin(t)]);
  }
  // Mirror everything but the apex to get the right-hand half.
  return [
    ...left,
    ...left.slice(0, -1).reverse().map(([x, y]): [number, number] => [ARCH_W - x, y]),
  ];
}

/**
 * Hang a semicircle off each chord to turn the sampled guide curve into
 * stonework.
 *
 * `open` runs 0 → 1 and unwinds the arch into a plain rectangle: the
 * sample points rise to the head and spread evenly across it while the
 * lobe radii inflate, until every arc is indistinguishable from its own
 * chord. Because both ends of the morph come off the same points, the
 * cusps flatten evenly instead of sliding about — the window opens rather
 * than dissolving.
 *
 * `unit` emits the path inside a 0–1 box, for a clipPath declared with
 * `clipPathUnits="objectBoundingBox"`. That lets one outline stretch to
 * an element of any size, which is what the arcade's centre bay needs as
 * it grows from a bay to the full viewport.
 */
function archPath(pts: [number, number][], open: number, unit: boolean) {
  const n = pts.length;
  const sx = unit ? 1 / ARCH_W : 1;
  const sy = unit ? 1 / ARCH_H : 1;
  const dp = unit ? 5 : 2;
  const f = (v: number) => v.toFixed(dp);

  // Each point's rectangle counterpart: spread evenly along the head.
  const p = pts.map(([x, y], i): [number, number] => {
    const flatX = (i / (n - 1)) * ARCH_W;
    return [x + (flatX - x) * open, y * (1 - open)];
  });

  // A semicircle on a chord is a lobe; the same chord under a very large
  // radius is a straight line. Inflating is what flattens the cusps.
  const bulge = 1 + open * open * 600;

  let d = `M${f(0)},${f(ARCH_H * sy)} L${f(p[0][0] * sx)},${f(p[0][1] * sy)}`;
  for (let i = 1; i < n; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const chord = Math.hypot(x1 - x0, y1 - y0);
    const rr = (chord / 2) * bulge;
    // sweep 0 bulges the lobe into the opening rather than out of it
    d += ` A${f(rr * sx)},${f(rr * sy)} 0 0 0 ${f(x1 * sx)},${f(y1 * sy)}`;
  }
  return `${d} L${f(ARCH_W * sx)},${f(ARCH_H * sy)} Z`;
}

export function cuspedArch(lobes: number) {
  return archPath(archPoints(lobes), 0, false);
}

/**
 * The house arch part-way open. `open` 0 is ARCH_D; `open` 1 is a plain
 * rectangle. `unit` returns it in a 0–1 box for objectBoundingBox clips.
 */
export function openArch(open: number, { unit = false, lobes = 9 } = {}) {
  return archPath(archPoints(lobes), open, unit);
}

export const ARCH_D = cuspedArch(9);

/** The closed arch as an objectBoundingBox clip — the arcade's flanking bays. */
export const ARCH_D_UNIT = openArch(0, { unit: true });
