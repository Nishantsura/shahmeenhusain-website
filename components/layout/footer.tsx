import Link from "next/link";

const SHOP = [
  { label: "All Collections", href: "/collections" },
  { label: "Lehengas", href: "/collections/lehengas" },
  { label: "Sarees", href: "/collections/sarees" },
  { label: "Dresses", href: "/collections/dresses" },
  { label: "Luxury Pret", href: "/collections/luxury-pret" },
];

const COMPANY = [
  { label: "Our Story", href: "/discover" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="container-edge py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-body text-sm tracking-[0.2em] text-ink"
            >
              SHAHMEEN HUSAIN
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
              Crafting timeless elegance through the art of embroidery and
              handcrafted ethnic wear.
            </p>
          </div>

          <div>
            <h4 className="eyebrow mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {SHOP.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-soft transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-4">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-soft transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-rule pt-6 text-xs text-ink-mute sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Shahmeen Husain. All rights reserved.</p>
          <p className="eyebrow">Made to order · Shipped worldwide</p>
        </div>
      </div>
    </footer>
  );
}
