import { CollectionsStage, type StageCard } from "@/components/ui/collections-stage";
import { Work, type WorkItem } from "@/components/sections/editorial";

/* ============================================================
   Collections — the film wall, and what is behind it
   ------------------------------------------------------------
   The pinned stage (`CollectionsStage`) is the gallery: a film panel and
   a rail of every collection the store has, which pans through on scroll
   and docks into the corner. The detailed product strips (`Work`) follow
   beneath, for the handful of collections we actually merchandise.
   ============================================================ */

export type Category = WorkItem & {
  /** The photograph shown on this collection's card. */
  image?: string;
};

interface CollectionsProps {
  /** Copy for the film panel on the left. */
  panel?: {
    eyebrow?: string;
    title?: string;
    blurb?: string;
    href?: string;
    cta?: string;
    /** A still for the film wall; omit to play the atelier showreel. */
    image?: string;
    /** Hide the open-face CTA button on this stage. */
    hideCta?: boolean;
  };
  /** Every collection in the store, for the gallery rail. */
  cards: StageCard[];
  /** The merchandised collections, for the product strips below. */
  work: WorkItem[];
}

export function Collections({ panel, cards, work }: CollectionsProps) {
  const {
    eyebrow = "The House",
    title = "The Collections",
    blurb =
      "Bridal, luxury pret and the chikankari of Lucknow — every piece cut, embroidered and finished by hand in the atelier.",
    href = "/collections",
    cta = "View all collections",
    image,
    hideCta,
  } = panel ?? {};

  return (
    <section className="bg-paper">
      {cards.length ? (
        <CollectionsStage
          panel={{ eyebrow, title, blurb, href, cta, image, hideCta }}
          cards={cards}
        />
      ) : null}

      {work.some((c) => c.products.length) ? <Work items={work} /> : null}
    </section>
  );
}
