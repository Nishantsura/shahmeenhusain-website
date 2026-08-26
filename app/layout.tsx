import type { Metadata } from "next";
import { Jost, Marcellus } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/commerce/cart-provider";
import { CartSheet } from "@/components/commerce/cart-sheet";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getMenu } from "@/lib/shopify";
import { Cursor } from "@/components/motion/cursor";
import { Preloader } from "@/components/motion/preloader";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/* Self-hosted via next/font — the legacy site pulled these from
   fonts.googleapis.com on every page load.

   Three faces, each doing one job:

   Marcellus — Roman inscriptional capitals with flared, carved serifs.
   It is the "posh" half: it reads as engraved rather than typeset, which
   is what separates a couture house from a boutique.

   Jost — geometric, quiet, and it tracks out beautifully in all-caps,
   which is all we ask of it. It stays out of the way of the other two. */
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shahmeenhusain.com"),
  title: {
    default: "Shahmeen Husain — Luxury Ethnic Wear",
    template: "%s — Shahmeen Husain",
  },
  description:
    "Handcrafted lehengas, sarees, gowns and occasion couture. Hand embroidery, made to order, delivered worldwide.",
  openGraph: {
    type: "website",
    siteName: "Shahmeen Husain",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /* The nav comes from the store's own Shopify menu, so editing
     Navigation in the admin updates it here. This is a cached fetch, not
     a cookie read — it does not opt routes out of static rendering. */
  const menu = await getMenu();

  return (
    <html
      lang="en"
      className={`${marcellus.variable} ${jost.variable} h-full`}
    >
      <head>
        {/* Reveal animations start from a hidden/clipped state, which is
            emitted during SSR. Without JS they would never play, leaving
            text permanently invisible — so un-hide everything up front. */}
        <noscript>
          <style>{`[data-reveal-word]{transform:none!important;opacity:1!important}
[data-preloader]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full">
        <CartProvider>
          <SmoothScroll>
            <Preloader />
            <Cursor />
            <Header menu={menu} />

            {/* The footer is pinned behind the page, not appended to it.
                Content scrolls over the top of it and the spacer below
                uncovers it at the end — which is why `main` needs an
                opaque background and a stacking context above it. */}
            <Footer />
            <main className="relative z-10 bg-paper">{children}</main>
            <div aria-hidden className="pointer-events-none h-svh" />

            <CartSheet />
            <WhatsAppButton />
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  );
}
