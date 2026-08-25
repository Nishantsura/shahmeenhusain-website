import { cn } from "@/lib/utils";

/**
 * Rule — lozenge — rule.
 *
 * The brand's smallest ornament, shared by the hero eyebrow and the
 * header, which is the point: repeating one mark in both the content and
 * the chrome is what stops the navigation looking bolted on.
 *
 * Draws in `currentColor` and carries no intrinsic size — give it a
 * width class and the viewBox keeps the proportion.
 */
export function Lozenge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 86 9"
      fill="none"
      aria-hidden
      className={cn("h-auto w-[86px]", className)}
    >
      <path d="M0 4.5H33M53 4.5H86" stroke="currentColor" strokeWidth="0.75" />
      <path
        d="M43 0.5 46.5 4.5 43 8.5 39.5 4.5Z"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
      />
    </svg>
  );
}
