import type { Metadata } from "next";
import { Cormorant, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/commerce/cart-provider";
import { CartSheet } from "@/components/commerce/cart-sheet";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Cursor } from "@/components/motion/cursor";
import { Preloader } from "@/components/motion/preloader";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getCart } from "@/lib/shopify/cart";

/* Self-hosted via next/font — the legacy site pulled these from
   fonts.googleapis.com on every page load. */
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
  // Read on the server so the cart badge and drawer are correct on first
  // paint rather than popping in after hydration.
  const cart = await getCart();

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cormorantGaramond.variable} ${montserrat.variable} h-full`}
    >
      <head>
        {/* Reveal animations start from a hidden/clipped state, which is
            emitted during SSR. Without JS they would never play, leaving
            text permanently invisible — so un-hide everything up front. */}
        <noscript>
          <style>{`[data-reveal-word]{transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider initialCart={cart}>
          <SmoothScroll>
            <Preloader />
            <Cursor />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartSheet />
          </SmoothScroll>
        </CartProvider>
      </body>
    </html>
  );
}
