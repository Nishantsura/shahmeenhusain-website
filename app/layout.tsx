import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
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

   Two faces. See the design-system block at the top of globals.css for
   why these two; the mechanics are here.

   Cormorant Garamond is the display face — an old-style Garamond with
   generous contrast and a heritage-couture feel, set in caps for every
   headline. It replaces Bodoni Moda, whose cold didone drama read as a
   Western fashion masthead rather than an atelier. Three weights: 400
   for the largest cuts where the hairlines carry themselves, 500 for
   section headlines, 600 where a title needs more body.

   Manrope carries every other word on the site — a soft grotesque that
   is quieter and warmer than the geometric Jost it replaces. Weights:
   300 for large caps copy, 400 for running text, 500/600 for labels. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
      className={`${cormorant.variable} ${manrope.variable} h-full`}
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
