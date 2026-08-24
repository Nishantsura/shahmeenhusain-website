import type { Money } from "@/lib/shopify/types";

/**
 * Matches the legacy formatter exactly (legacy/js/shopify.js):
 * en-IN, no fraction digits.
 */
export function formatMoney(
  money: Money | { amount: string; currencyCode?: string } | null | undefined,
  fallbackCurrency = "INR",
): string {
  if (!money) return "";
  const currency = money.currencyCode || fallbackCurrency;
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}
