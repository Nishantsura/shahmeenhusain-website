"use client";

import Image from "next/image";
import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Wordmark hero. No photography behind the type by design — the name is
 * the identity, and a single cut-out figure stands between its halves.
 * Below 560px the name stacks and she sits behind it: the single-line
 * lockup collides at phone widths.
 */
export function Hero() {
  return (
    <section className="relative flex h-svh min-h-[540px] flex-col items-center justify-center overflow-hidden bg-paper">
      <div className="relative flex w-full items-center justify-center px-5 max-[560px]:flex-col md:px-10">
        <Word text="Shahmeen" delay={0.05} />

        <span className="relative z-[2] grid shrink-0 place-items-center max-[560px]:absolute max-[560px]:inset-0 max-[560px]:z-0 mx-[clamp(-8rem,-9vw,-3rem)] max-[560px]:mx-0">
          <span
            aria-hidden
            className="pointer-events-none absolute h-[62%] w-[78%] rounded-full blur-[30px]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(214,176,150,0.24) 0%, rgba(214,176,150,0.09) 44%, transparent 72%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.8, delay: 0.3, ease: EASE }}
            className="relative z-[1]"
          >
            <Image
              src="/hero-model.webp"
              alt=""
              width={871}
              height={1428}
              priority
              sizes="(max-width: 560px) 60vw, 300px"
              className="h-[clamp(20rem,52vh,34rem)] w-auto object-contain max-[560px]:h-[min(50vh,23rem)] max-[560px]:opacity-50"
              style={{
                filter: "drop-shadow(0 26px 42px rgba(74,52,40,0.20))",
              }}
            />
          </motion.div>
        </span>

        <Word text="Husain" delay={0.16} />
      </div>

      <span className="relative z-[2] mt-1.5 block overflow-hidden max-[560px]:mt-3">
        <motion.span
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.3, delay: 0.35, ease: EASE }}
          className="block font-body text-label lowercase text-ink-mute"
          style={{ letterSpacing: "0.62em", textIndent: "0.62em" }}
        >
          studio
        </motion.span>
      </span>

      <motion.a
        href="#campaign"
        aria-label="Scroll to explore"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center text-brand md:bottom-12"
      >
        <span className="h-[clamp(38px,7vh,66px)] w-px animate-[scroll-cue_2.6s_ease-in-out_infinite] bg-current" />
        <svg
          width="13"
          height="9"
          viewBox="0 0 13 9"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.1}
          className="-mt-px animate-[scroll-cue_2.6s_ease-in-out_infinite]"
        >
          <polyline points="1 1 6.5 7.5 12 1" />
        </svg>
      </motion.a>
    </section>
  );
}

function Word({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="relative z-[1] block overflow-hidden font-display text-[clamp(2.6rem,11.5vw,11rem)] font-light leading-[0.9] tracking-[-0.035em] text-ink whitespace-nowrap max-[560px]:z-[2] max-[560px]:text-[clamp(2.9rem,15.5vw,5.25rem)] max-[560px]:leading-[1.02]">
      <motion.span
        initial={{ y: "108%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.5, delay, ease: EASE }}
        className="block"
      >
        {text}
      </motion.span>
    </span>
  );
}
