import { Hero } from "@/components/sections/hero";
import {
  About,
  FullBleed,
  Showreel,
  Stats,
  Work,
} from "@/components/sections/editorial";
import { EnquiryCta } from "@/components/sections/enquiry-cta";
import { StickyPanels } from "@/components/sections/panels";
import { ScrollStatement } from "@/components/motion/scroll-statement";
import { getCollectionOrAll } from "@/lib/shopify";

// Rebuild the home page at most once an hour; product data rarely
// changes faster than that and this keeps it served from cache.
export const revalidate = 3600;

export default async function HomePage() {
  // Three visually distinct edits, fetched in parallel on the server.
  const [bridal, festive, ready] = await Promise.all([
    getCollectionOrAll("lehengas", { first: 12 }),
    getCollectionOrAll("luxury-pret", { first: 12 }),
    getCollectionOrAll("ready-to-ship", { first: 12 }),
  ]);

  const pool = [...bridal.products, ...festive.products, ...ready.products];
  const plate = (i: number) => pool[i]?.featuredImage?.url;

  return (
    <>
      <Hero />

      <section id="statement">
        <ScrollStatement text="Made by hand, for the one day it has to be perfect." />
      </section>

      <Showreel image={plate(3)} />
      <About />
      <Stats image={plate(1)} />
      <FullBleed image={plate(5)} />

      <Work
        items={[
          {
            title: "Bridal",
            blurb:
              "Handcrafted lehengas and ensembles for the day everything changes — zardozi, dabka and thread work laid entirely by hand.",
            href: "/collections/lehengas",
            products: bridal.products.slice(0, 8),
            attributes: [
              "Hand Embroidery",
              "Zardozi",
              "Raw Silk",
              "Made To Order",
              "Dabka Work",
              "Bespoke Fitting",
            ],
          },
          {
            title: "Festive",
            blurb:
              "For the mehendi, the sangeet, and every celebration in between. Lighter hands, brighter palettes, the same obsessive finish.",
            href: "/collections/luxury-pret",
            products: festive.products.slice(0, 8),
            attributes: [
              "Mirror Work",
              "Organza",
              "Thread Work",
              "Sarees",
              "Gowns",
              "Contemporary Drape",
            ],
          },
          {
            title: "Ready To Ship",
            blurb:
              "Finished pieces from the atelier, sized and waiting. Everything here leaves within a week.",
            href: "/collections/ready-to-ship",
            products: ready.products.slice(0, 8),
            attributes: [
              "In Stock",
              "Ships In 7 Days",
              "Luxury Pret",
              "Co-ords",
              "Anarkalis",
              "Worldwide Delivery",
            ],
          },
        ]}
      />

      <StickyPanels
        images={[plate(2), plate(7), plate(4), plate(9)].filter(Boolean) as string[]}
      />

      <EnquiryCta image={plate(6)} />
    </>
  );
}
