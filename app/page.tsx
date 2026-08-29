import { Hero } from "@/components/sections/hero";
import { About, Feature, Showreel } from "@/components/sections/editorial";
import { Collections, type Category } from "@/components/sections/collections";
import { EnquiryCta } from "@/components/sections/enquiry-cta";
import { ScrollStatement } from "@/components/motion/scroll-statement";
import type { StageCard } from "@/components/ui/collections-stage";
import { getCollectionOrAll, getCollectionsIndex, getMenu } from "@/lib/shopify";

// Rebuild the home page at most once an hour; product data rarely
// changes faster than that and this keeps it served from cache.
export const revalidate = 3600;

const firstImage = (products: { featuredImage?: { url: string } | null }[]) =>
  products.find((p) => p.featuredImage?.url)?.featuredImage?.url;

/* ------------------------------------------------------------------
   The gallery rail is an edit, not a dump of the admin.

   The store carries merchandising buckets — Sale, New, New Arrivals,
   women — that are ways of sorting stock rather than things to browse,
   plus Lehengas, which the Bridal strip below already covers. None of
   them belong in a rail that reads as the house's collections.
   ------------------------------------------------------------------ */
const RAIL_EXCLUDE = new Set([
  "sale",
  "new",
  "new arrivals",
  "women",
  "lehengas",
]);

/** How many collections the rail shows, at most. */
const RAIL_SIZE = 7;

/** Named first, in this order; anything else keeps the store's order. */
const RAIL_ORDER = [
  "luxury pret",
  "chikankari edit",
  "sarees",
  "anarkalis",
  "shararas",
  "co-ords",
  "dresses",
];

const rank = (title: string) => {
  const i = RAIL_ORDER.indexOf(title.trim().toLowerCase());
  return i === -1 ? RAIL_ORDER.length : i;
};

export default async function HomePage() {
  // The three collections in the arcade, plus Ready to Ship, fetched in
  // parallel on the server. All four handles resolve against the live
  // store — nothing here is a marketing word standing in for a
  // collection that does not exist.
  const [bridal, luxe, chikan, ready, allCollections, menu] = await Promise.all([
    getCollectionOrAll("lehengas", { first: 24 }),
    getCollectionOrAll("luxury-pret", { first: 24 }),
    getCollectionOrAll("chikankari", { first: 24 }),
    getCollectionOrAll("ready-to-ship", { first: 12 }),
    // Every real collection in the store, for cover art.
    getCollectionsIndex({ first: 40 }),
    // The store's own navigation — the same menu the header renders, so
    // the homepage rails and the navbar dropdowns can never drift.
    getMenu(),
  ]);

  const pool = [...bridal.products, ...luxe.products, ...ready.products];
  const plate = (i: number) => pool[i]?.featuredImage?.url;

  const hero: Category = {
    title: "Bridal",
    blurb:
      "Handcrafted lehengas and ensembles for the day everything changes — zardozi, dabka and thread work laid entirely by hand.",
    href: "/collections/lehengas",
    image: firstImage(bridal.products),
    products: bridal.products.slice(0, 8),
    attributes: ["Hand Embroidery", "Zardozi", "Raw Silk", "Made To Order", "Dabka Work", "Bespoke Fitting"],
  };

  const luxuryPret: Category = {
    title: "Luxury Pret",
    blurb:
      "Ready-to-wear with couture hands — refined silhouettes finished to the same standard as the made-to-order floor.",
    href: "/collections/luxury-pret",
    image: firstImage(luxe.products),
    products: luxe.products.slice(0, 8),
    attributes: ["Ready To Wear", "Organza", "Contemporary Drape", "Thread Work", "Gowns", "Everyday Luxe"],
  };

  const chikankari: Category = {
    title: "Chikankari",
    blurb:
      "The needlework Lucknow is named for — shadow work and jaali laid by hand on mull, organza and silk, the atelier's own craft.",
    href: "/collections/chikankari",
    image: firstImage(chikan.products),
    products: chikan.products.slice(0, 8),
    attributes: ["Hand Chikankari", "Shadow Work", "Jaali", "Mull Cotton", "Organza", "Lucknow"],
  };

  const readyToShip: Category = {
    title: "Ready to Ship",
    blurb:
      "Finished pieces from the atelier, sized and waiting — the only floor a visitor can buy from today.",
    href: "/collections/ready-to-ship",
    image: firstImage(ready.products),
    products: ready.products.slice(0, 8),
    attributes: ["In Stock", "Sized", "Leaves Within A Week", "Atelier Finished"],
  };

  // Cover art, looked up by handle against the live store.
  const byHandle = new Map(allCollections.map((c) => [c.handle, c]));

  /**
   * Turn one of the navbar's dropdown menus into a rail of cards, so a
   * homepage row shows exactly what its navbar counterpart lists — same
   * collections, same labels, same order. A child only becomes a card
   * when its collection resolves and carries a cover, so the rail can
   * never lead to a blank grid.
   */
  const menuRail = (title: string): StageCard[] => {
    const top = menu?.find((m) => m.title.trim().toLowerCase() === title);
    return (top?.items ?? [])
      .map((child) => {
        const handle = child.href.match(/\/collections\/([^/?#]+)/)?.[1];
        const cover = handle ? byHandle.get(handle)?.cover?.url : undefined;
        return cover ? { title: child.title, href: child.href, image: cover } : null;
      })
      .filter((c): c is StageCard => Boolean(c));
  };

  /**
   * Fallback rail, used only if Shopify's menu fails to load: every real
   * collection in the store, house order first. Keeps the section alive
   * even when the navbar itself has fallen back.
   */
  const fallbackCards = allCollections
    .filter((c) => c.cover?.url && !RAIL_EXCLUDE.has(c.title.trim().toLowerCase()))
    .sort((a, b) => rank(a.title) - rank(b.title))
    .slice(0, RAIL_SIZE)
    .map((c) => ({
      title: c.title,
      href: `/collections/${c.handle}`,
      image: c.cover!.url,
    }));

  // The gallery rail mirrors the navbar's "Collections" dropdown; the
  // shop rail mirrors "Shop". Both come straight from the store's menu.
  const collectionsCards = menuRail("collections");
  const shopCards = menuRail("shop");
  const galleryCards = collectionsCards.length ? collectionsCards : fallbackCards;

  return (
    <>
      <Hero />

      <section id="statement" className="bg-paper pb-[clamp(1rem,2vw,2rem)] pt-[clamp(4rem,9vw,7rem)]">
        <ScrollStatement text="Made by hand, for the one day it has to be perfect." />
      </section>

      {/* Ready to Ship is promoted out of the stack at the foot of the
          page: it is the only thing on the site a visitor can buy today,
          so it should not be the last carousel they reach. */}
      <Feature
        title="Ready to Ship"
        blurb="Finished pieces from the atelier, sized and waiting."
        href="/collections/ready-to-ship"
        cta="Shop ready to ship"
        products={ready.products.slice(0, 10)}
      />

      <Showreel />
      <About />

      {/* The doorway into the catalogue: the film wall folds into a strip
          as the collections travel past it, then the detailed product
          strips beneath. */}
      <Collections
        panel={{ hideCta: true }}
        cards={galleryCards}
        work={[hero, luxuryPret, chikankari, readyToShip]}
      />

      {/* The same film-wall stage, turned on the Shop menu: its own
          heading and a rail of the garment categories beneath it — the
          exact set the navbar's Shop dropdown lists. Stage only, so this
          is category browsing, not a second copy of the product strips
          above. */}
      {shopCards.length ? (
        <Collections
          panel={{
            eyebrow: "Shop by Category",
            title: "Shop",
            blurb:
              "Every silhouette the house cuts — lehengas, anarkalis, sarees, co-ords and dresses, finished to the standard of the made-to-order floor.",
            href: "/collections/women",
            cta: "Shop all",
            image: luxuryPret.image,
          }}
          cards={shopCards}
          work={[]}
        />
      ) : null}

      <EnquiryCta image={plate(6)} />
    </>
  );
}
