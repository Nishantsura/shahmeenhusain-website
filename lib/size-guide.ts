/* ============================================
   SIZE — the house chart, and made-to-measure
   --------------------------------------------
   Every garment in the catalogue is cut to order, so a size label is
   really a base pattern rather than a stocked item. That is why this
   file carries two things: the standard chart the size chips resolve
   against, and the field set a customer fills in when none of those
   patterns is right.

   The chart is static on purpose. It is house-wide — one atelier, one
   block — so keeping it here means it cannot drift between products.
   When the store starts carrying garments cut on a different block,
   this becomes a Shopify metafield read in `lib/shopify/queries.ts`
   and the shape below is what it should normalise to.
   ============================================ */

export type Unit = "in" | "cm";

/** One row of the house chart. Inches are the source of truth; cm is
    derived on read so the two can never disagree. */
export type SizeRow = {
  size: string;
  bust: number;
  waist: number;
  hip: number;
};

export const SIZE_CHART: SizeRow[] = [
  { size: "XS", bust: 32, waist: 26, hip: 35 },
  { size: "S", bust: 34, waist: 28, hip: 37 },
  { size: "M", bust: 36, waist: 30, hip: 39 },
  { size: "L", bust: 38, waist: 32, hip: 41 },
  { size: "XL", bust: 40, waist: 34, hip: 43 },
  { size: "XXL", bust: 42, waist: 36, hip: 45 },
  { size: "3XL", bust: 44, waist: 38, hip: 47 },
  { size: "4XL", bust: 46, waist: 40, hip: 49 },
  { size: "5XL", bust: 48, waist: 42, hip: 51 },
  { size: "6XL", bust: 50, waist: 44, hip: 53 },
];

export function formatLength(inches: number, unit: Unit): string {
  return unit === "in" ? `${inches}"` : `${Math.round(inches * 2.54)} cm`;
}

/* --------------------------------------------
   Made-to-measure fields
   -------------------------------------------- */

export type MeasurementField = {
  key: string;
  label: string;
  /** Shown under the input, and reused as the "how to measure" note in
      the chart tab — one sentence, one place to edit it. */
  hint: string;
  required?: boolean;
};

/* Taken on the body, not on a garment the customer already owns — that
   is what the hints are for. Bust/waist/hip/height are required because
   the atelier cannot cut anything without them; the rest refine the fit
   and are filled in by customers who know their numbers. */
const CORE_FIELDS: MeasurementField[] = [
  {
    key: "bust",
    label: "Bust",
    hint: "Around the fullest part, tape level under the arms",
    required: true,
  },
  {
    key: "waist",
    label: "Waist",
    hint: "The narrowest part of the torso, above the navel",
    required: true,
  },
  {
    key: "hip",
    label: "Hip",
    hint: "Around the fullest part of the hips, feet together",
    required: true,
  },
  {
    key: "shoulder",
    label: "Shoulder",
    hint: "Seam to seam, straight across the back",
  },
  {
    key: "armhole",
    label: "Arm hole",
    hint: "Around the top of the arm, through the underarm",
  },
  {
    key: "sleeve",
    label: "Sleeve length",
    hint: "Shoulder seam to where the sleeve should end",
  },
  {
    key: "height",
    label: "Height",
    hint: "Barefoot, head to floor",
    required: true,
  },
];

/* Lengths depend on what is being cut, so they follow the product type
   rather than sitting in the core set. A lehenga needs a waist-to-floor
   and a blouse length; a dress needs one length and no blouse at all. */
const LENGTHS_BY_TYPE: Record<string, MeasurementField[]> = {
  lehengas: [
    {
      key: "blouseLength",
      label: "Blouse length",
      hint: "Shoulder to where the blouse should end",
    },
    {
      key: "skirtLength",
      label: "Waist to floor",
      hint: "Natural waist to the floor, in the heel height you will wear",
      required: true,
    },
  ],
  saree: [
    {
      key: "blouseLength",
      label: "Blouse length",
      hint: "Shoulder to where the blouse should end",
    },
    {
      key: "drapeLength",
      label: "Waist to floor",
      hint: "Natural waist to the floor, in the heel height you will wear",
      required: true,
    },
  ],
  dresses: [
    {
      key: "dressLength",
      label: "Dress length",
      hint: "Shoulder to where the hem should fall",
      required: true,
    },
  ],
  "co-ords": [
    {
      key: "topLength",
      label: "Top length",
      hint: "Shoulder to where the top should end",
    },
    {
      key: "bottomLength",
      label: "Waist to floor",
      hint: "Natural waist to the floor, in the heel height you will wear",
      required: true,
    },
  ],
};

const DEFAULT_LENGTHS: MeasurementField[] = [
  {
    key: "garmentLength",
    label: "Garment length",
    hint: "Shoulder to where the hem should fall",
    required: true,
  },
];

/** The field set for one garment. Unknown product types fall back to a
    single length rather than to nothing — a missing field is a garment
    the atelier has to phone about. */
export function measurementFields(productType: string): MeasurementField[] {
  const lengths =
    LENGTHS_BY_TYPE[productType.trim().toLowerCase()] ?? DEFAULT_LENGTHS;
  return [...CORE_FIELDS, ...lengths];
}

/* --------------------------------------------
   The customer's own measurements
   -------------------------------------------- */

export type CustomSize = {
  unit: Unit;
  /** Keyed by MeasurementField.key. Kept as strings: these come
      straight off inputs and are only ever displayed or sent. */
  values: Record<string, string>;
  notes: string;
};

export function emptyCustomSize(): CustomSize {
  return { unit: "in", values: {}, notes: "" };
}

function filled(custom: CustomSize, fields: MeasurementField[]) {
  return fields
    .map((f) => ({ field: f, value: custom.values[f.key]?.trim() }))
    .filter((e): e is { field: MeasurementField; value: string } =>
      Boolean(e.value),
    );
}

/** Which required fields are still blank. Empty array means saveable. */
export function missingRequired(
  custom: CustomSize,
  fields: MeasurementField[],
): MeasurementField[] {
  return fields.filter(
    (f) => f.required && !custom.values[f.key]?.trim(),
  );
}

/** One line for the buy panel: the first three numbers, no more. */
export function customSizeSummary(
  custom: CustomSize,
  fields: MeasurementField[],
): string {
  const entries = filled(custom, fields).slice(0, 3);
  if (!entries.length) return "";
  return entries
    .map(({ field, value }) => `${field.label} ${value}${custom.unit === "in" ? '"' : "cm"}`)
    .join("  ·  ");
}

/**
 * Cart line attributes.
 *
 * These ride on the Shopify line, so they survive into checkout, the
 * order confirmation and the admin — which is the whole point: the
 * atelier reads the order, not this page. Keys are deliberately plain
 * words; Shopify hides any attribute whose key starts with `_`.
 */
export function customSizeAttributes(
  custom: CustomSize,
  fields: MeasurementField[],
): { key: string; value: string }[] {
  const suffix = custom.unit === "in" ? " in" : " cm";
  const attrs = [
    { key: "Size", value: "Made to measure" },
    ...filled(custom, fields).map(({ field, value }) => ({
      key: field.label,
      value: `${value}${suffix}`,
    })),
  ];
  const notes = custom.notes.trim();
  // Shopify caps attribute values at 255 characters.
  if (notes) attrs.push({ key: "Notes", value: notes.slice(0, 255) });
  return attrs;
}

/**
 * The base pattern a made-to-measure order is cut from.
 *
 * Shopify still needs a variant id even when nothing about the garment
 * is standard, so we resolve the nearest chart row to the bust the
 * customer entered and hand back that size. The measurements on the
 * line are what the atelier actually works to; this only decides which
 * block they start from (and keeps the order off a sold-out variant).
 */
export function basePatternSize(
  custom: CustomSize,
  available: string[],
): string | undefined {
  if (!available.length) return undefined;

  const raw = Number(custom.values.bust);
  if (!Number.isFinite(raw) || raw <= 0) return available[0];
  const bustIn = custom.unit === "cm" ? raw / 2.54 : raw;

  const candidates = SIZE_CHART.filter((r) => available.includes(r.size));
  if (!candidates.length) return available[0];

  return candidates.reduce((best, row) =>
    Math.abs(row.bust - bustIn) < Math.abs(best.bust - bustIn) ? row : best,
  ).size;
}
