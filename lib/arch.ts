/**
 * The house motif: a multifoil (cusped) Mughal arch, generated rather
 * than hand-drawn. A multifoil arch is a two-centred pointed arch whose
 * opening is then scalloped into lobes, and nine lobes hand-tuned as
 * Béziers is a losing game — the cusps come out uneven and flatten at
 * small sizes. Sampling the guide curve and hanging a semicircle off each
 * chord gets them identical by construction, and makes the lobe count a
 * number we can tune.
 *
 * Shared so the hero's photo bays and the preloader's ornament are the
 * same shape by construction and can never drift apart.
 */
export const ARCH_W = 300;
export const ARCH_H = 480;

export function cuspedArch(lobes: number) {
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
  const pts = [
    ...left,
    ...left.slice(0, -1).reverse().map(([x, y]): [number, number] => [ARCH_W - x, y]),
  ];

  let d = `M0,${ARCH_H} L${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const chord = Math.hypot(x1 - x0, y1 - y0);
    // sweep 0 bulges the lobe into the opening rather than out of it
    d += ` A${(chord / 2).toFixed(2)},${(chord / 2).toFixed(2)} 0 0 0 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  }
  return `${d} L${ARCH_W},${ARCH_H} Z`;
}

export const ARCH_D = cuspedArch(9);
