"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/collections" },
  { label: "Discover", href: "/discover" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "WhatsApp", href: "https://wa.me/+919XXXXXXXXX" },
  { label: "Policies", href: "/contact" },
];

/**
 * Pinned footer.
 *
 * This is fixed behind the page rather than appended to the end of it —
 * `app/layout.tsx` stacks `main` above it and leaves a viewport-tall
 * spacer underneath, so the page slides off the footer instead of the
 * footer scrolling up into view. It only ever needs one screen, which is
 * why it can be `h-svh` and pinned.
 */
export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="fixed inset-x-0 bottom-0 z-0 h-svh overflow-hidden bg-panel">
      <div className="gutter flex h-full flex-col justify-between py-[clamp(1.5rem,3vw,2.2rem)]">
        <nav className="flex flex-wrap items-baseline gap-x-5">
          {NAV.map((item, i) => (
            <span key={item.href} className="flex items-baseline gap-x-5">
              <Link
                href={item.href}
                className={cn(
                  "statement transition-colors hover:text-paper",
                  /* On the dark panel the ink tokens are near-invisible;
                     dimming is a wash of `paper`, not a darker ink. */
                  pathname === item.href ? "text-paper" : "text-paper/35",
                )}
              >
                {item.label}
              </Link>
              {i < NAV.length - 1 ? (
                <span aria-hidden className="statement text-paper/20">
                  /
                </span>
              ) : null}
            </span>
          ))}
        </nav>

        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              className="label text-paper"
            >
              Shahmeen Husain
            </Link>
            <p className="font-body text-fine text-paper/60">
              © {new Date().getFullYear()}
            </p>
          </div>

          <div className="flex w-full flex-col gap-[clamp(1.25rem,2.5vw,2.2rem)] md:w-[25rem]">
            <p className="lead text-body text-paper">
              Flagship Store, Road No. 12
              <br />
              Banjara Hills
              <br />
              Hyderabad, Telangana 500034
            </p>

            <a
              href="mailto:hello@shahmeenhusain.com"
              className="lead text-body text-paper transition-colors hover:text-gold"
            >
              hello@shahmeenhusain.com
            </a>

            <div className="flex flex-wrap items-center gap-2">
              {SOCIAL.map((item, i) => (
                <span key={item.label} className="flex items-center gap-2">
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener" : undefined}
                    className="label text-paper transition-colors hover:text-gold"
                  >
                    {item.label}
                  </a>
                  {i < SOCIAL.length - 1 ? (
                    <span aria-hidden className="label text-paper/40">
                      /
                    </span>
                  ) : null}
                </span>
              ))}
            </div>

            <p className="label max-w-[42ch] font-light leading-[1.9] text-paper/60">
              Every piece is cut, embroidered and finished by hand in our own
              atelier. We pay our karigars by the hour, not by the piece.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
