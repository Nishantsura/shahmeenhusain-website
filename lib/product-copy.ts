/* ============================================
   PRODUCT COPY — pulling structure out of a Shopify description
   --------------------------------------------
   Every description in the store is written to one shape: a sentence
   describing the piece, then a run of `LABEL: value` lines (FABRIC,
   COLOR, EMBROIDERY/PRINT). Rendering that blob as one paragraph wastes
   it — the sentence belongs under the title in the buy panel, and the
   labelled lines belong in a spec list in the accordion.

   This parser is deliberately forgiving: anything it cannot classify
   ends up in `lead`, so a description written in some other shape still
   renders as prose rather than disappearing.
   ============================================ */

export type Spec = { label: string; value: string };

export type ProductCopy = {
  /** The descriptive sentence(s). May be empty. */
  lead: string;
  specs: Spec[];
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#8217": "’",
};

function decode(input: string): string {
  return input.replace(/&(#?\w+);/g, (match, entity: string) =>
    entity in ENTITIES ? ENTITIES[entity] : match,
  );
}

function clean(input: string): string {
  return decode(input.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/* `LABEL: value`, where the label is a word or two — long enough to
   cover EMBROIDERY/PRINT, short enough that a colon inside a sentence
   ("Note: this piece…" is fine, "…in 2024: a study" is not) does not
   swallow half a paragraph. */
const SPEC_LINE = /^([A-Za-z][A-Za-z/&' -]{1,24}):\s*(.+)$/;

/* Shopify's editor writes the labelled lines as separate <p>s, but the
   plain-text description arrives as one run-on. Split ahead of each
   label so both paths reach the same place.

   Two constraints keep this honest, and both are load-bearing. The
   lookbehind stops a label matching mid-word — a plain `\b` also matches
   inside EMBROIDERY/PRINT and leaves an orphaned "EMBROIDERY/" in the
   lead. And the label must be all caps, which is how the store writes
   them: without that, "FABRIC: Chikankari Georgette COLOR: Maroon" splits
   before "Georgette" too, because a lower-case run followed by a colon is
   indistinguishable from a label. A run-on cannot be split without some
   such convention; a labelled <p> does not need splitting at all. */
function splitAtLabels(text: string): string[] {
  return text
    .split(/(?<=^|\s)(?=[A-Z][A-Z/&' -]{1,24}:\s)/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

/* FABRIC → Fabric, EMBROIDERY/PRINT → Embroidery / Print. The store is
   written in US English and the rest of the site is not. */
function titleCase(label: string): string {
  return label
    .toLowerCase()
    .split("/")
    .map((word) =>
      word
        .trim()
        .replace(/^./, (c) => c.toUpperCase())
        .replace(/\bcolor\b/i, "Colour"),
    )
    .join(" / ");
}

export function parseDescription(
  descriptionHtml?: string | null,
  description?: string | null,
): ProductCopy {
  const blocks = descriptionHtml
    ? [...descriptionHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) =>
        clean(m[1]),
      )
    : [];

  // No paragraphs at all (or an empty descriptionHtml): fall back to the
  // plain-text field, which is the same content without the markup.
  const source = blocks.filter(Boolean).length
    ? blocks.filter(Boolean)
    : [clean(descriptionHtml ?? "") || (description ?? "").trim()].filter(
        Boolean,
      );

  const lead: string[] = [];
  const specs: Spec[] = [];

  for (const block of source) {
    for (const part of splitAtLabels(block)) {
      const match = SPEC_LINE.exec(part);
      if (match) {
        specs.push({ label: titleCase(match[1]), value: match[2].trim() });
      } else {
        lead.push(part);
      }
    }
  }

  return { lead: lead.join(" "), specs };
}
