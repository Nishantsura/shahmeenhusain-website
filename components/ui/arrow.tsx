/**
 * The house's CTA arrow — diagonal, stroke-only, translates up-right on
 * hover. Every "see more" link on the site draws this same glyph, so it
 * lives here once instead of as a local `Arrow` re-typed per file.
 */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} className={className}>
      <line x1="2" y1="14" x2="14" y2="2" />
      <polyline points="5 2 14 2 14 11" />
    </svg>
  );
}
