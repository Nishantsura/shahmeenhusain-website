import { Hero } from "@/components/sections/hero";
import {
  BigStatement,
  CampaignScene,
  Closing,
  CollectionBlock,
  Experience,
  Philosophy,
  Stats,
} from "@/components/sections/editorial";
import { getCollectionOrAll } from "@/lib/shopify";

// Rebuild the home page at most once an hour; product data rarely
// changes faster than that and this keeps it served from cache.
export const revalidate = 3600;

export default async function HomePage() {
  // Two visually distinct edits, fetched in parallel on the server.
  const [bridal, festive] = await Promise.all([
    getCollectionOrAll("lehengas", { first: 12 }),
    getCollectionOrAll("luxury-pret", { first: 12 }),
  ]);

  const campaignImage = bridal.products[3]?.featuredImage?.url;
  const bridalImage = bridal.products[0]?.featuredImage?.url;
  const festiveImage = festive.products[0]?.featuredImage?.url;

  return (
    <>
      <Hero />
      <CampaignScene image={campaignImage} />
      <Philosophy />
      <Stats />

      <CollectionBlock
        index="02"
        title="Bridal"
        blurb="Handcrafted lehengas and ensembles for the day everything changes — adorned with zardozi, dabka and thread work laid entirely by hand."
        href="/collections/lehengas"
        image={bridalImage}
        products={bridal.products.slice(0, 8)}
        attributes={[
          "Hand Embroidery",
          "Zardozi",
          "Raw Silk",
          "Made To Order",
          "Dabka Work",
          "Bespoke Fitting",
        ]}
      />

      <BigStatement />

      <CollectionBlock
        index="03"
        title="Festive"
        blurb="For the mehendi, the sangeet, and every celebration in between. Lighter hands, brighter palettes, the same obsessive finish."
        href="/collections/luxury-pret"
        image={festiveImage}
        products={festive.products.slice(0, 8)}
        alt
        attributes={[
          "Mirror Work",
          "Organza",
          "Thread Work",
          "Sarees",
          "Gowns",
          "Contemporary Drape",
        ]}
      />

      <Experience />
      <Closing />
    </>
  );
}
