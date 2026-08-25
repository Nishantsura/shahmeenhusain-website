"use client";

/**
 * Persistent WhatsApp contact, bottom right on every page.
 *
 * Deliberately not the stock green circle. This brand is espresso and
 * gold everywhere else and a saturated green puck reads as a plugin
 * bolted onto the page; the glyph alone is unmistakable, so the container
 * can belong to the site. Flip `bg-panel` to `bg-[#25D366]` and the ring
 * off if you want the familiar green instead.
 *
 * Collapsed to a disc, it widens on hover to name itself. The label is
 * in the DOM at all times for screen readers — width, not visibility, is
 * what animates.
 *
 * NOT WIRED UP: the number below is the placeholder already used on the
 * contact page. It needs the real one before launch.
 */
const WHATSAPP_NUMBER = "+919XXXXXXXXX";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-[900] flex h-14 items-center rounded-full border border-gold/50 bg-panel pl-[14px] pr-[14px] text-paper shadow-[0_10px_30px_rgba(36,24,17,0.28)] transition-[padding,border-color] duration-500 ease-out hover:border-gold hover:pr-6 md:bottom-9 md:right-9"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-[26px] w-[26px] shrink-0">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.33 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23a8.19 8.19 0 0 1 5.82 2.42 8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Z" />
      </svg>

      <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap font-body text-[0.6875rem] font-light uppercase tracking-[0.28em] text-gold opacity-0 transition-all duration-500 ease-out group-hover:ml-3 group-hover:max-w-[9rem] group-hover:opacity-100">
        WhatsApp us
      </span>
    </a>
  );
}
