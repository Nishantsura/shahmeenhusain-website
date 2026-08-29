"use client";

import Image from "next/image";
import { useState } from "react";

import { Reveal, RevealWords } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Channel = "email" | "call";

/**
 * Closing enquiry block.
 *
 * The page's last word, so it sits on the house's dark panel ground and
 * carries the weight of a coda rather than a tacked-on form. The channel
 * toggle swaps which single field is asked for — the reference does the
 * same, and it keeps the invitation to two inputs, not four.
 *
 * NOT WIRED UP: like the contact form and the newsletter, this posts
 * nowhere. It needs a real endpoint before launch.
 */
export function EnquiryCta({ image }: { image?: string }) {
  const [channel, setChannel] = useState<Channel>("email");

  return (
    <section className="bg-panel text-paper">
      <div className="gutter grid items-stretch gap-[clamp(2.5rem,5vw,4.5rem)] py-(--space-section) md:grid-cols-[0.9fr_1.1fr]">
        {/* The photograph, framed by an offset gold hairline. */}
        {image ? (
          <Reveal kind="fade" className="relative order-last md:order-first">
            <div className="absolute inset-0 translate-x-3 translate-y-3 border border-gold/40" aria-hidden />
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}

        {/* The invitation. */}
        <div className="flex flex-col justify-center gap-[clamp(1.5rem,3vw,2.4rem)]">
          <div className="flex flex-col gap-4">
            <Reveal as="p" kind="rise" className="eyebrow text-gold">
              Enquiries &amp; Appointments
            </Reveal>
            <RevealWords
              as="h2"
              className="statement statement-tight text-paper"
              text="Begin a commission"
            />
            <RevealWords
              as="p"
              className="copy max-w-[46ch] text-paper/70"
              text="Most of our best work starts with a client who cannot quite put their finger on it. Turning that into a drawing, and the drawing into a fitting, is the part we are good at."
            />
          </div>

          <Reveal kind="rise" delay={0.12} className="w-full">
            <form
              className="flex w-full flex-col gap-6"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Channel toggle — a quiet segmented control. */}
              <div className="flex flex-col gap-2.5">
                <span className="eyebrow text-paper/45">How should we reach you?</span>
                <div className="flex w-fit border border-paper/15">
                  {(["email", "call"] as const).map((value) => (
                    <label
                      key={value}
                      className={cn(
                        "label cursor-pointer px-6 py-2.5 transition-colors",
                        channel === value
                          ? "bg-gold text-panel"
                          : "text-paper/60 hover:text-paper",
                      )}
                    >
                      <input
                        type="radio"
                        name="channel"
                        value={value}
                        checked={channel === value}
                        onChange={() => setChannel(value)}
                        className="sr-only"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Field placeholder="Your name" name="name" autoComplete="name" />
                {channel === "email" ? (
                  <Field placeholder="Your email" name="email" type="email" autoComplete="email" />
                ) : (
                  <Field placeholder="Your number" name="phone" type="tel" autoComplete="tel" />
                )}
              </div>

              <button
                type="submit"
                className="label group flex items-center justify-center gap-3 border border-gold bg-gold px-8 py-4 text-panel transition-colors hover:bg-transparent hover:text-gold"
              >
                Send enquiry
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                  &rarr;
                </span>
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className="label h-[54px] w-full border-b border-paper/20 bg-transparent px-1 text-paper outline-none transition-colors placeholder:text-paper/35 focus:border-gold"
    />
  );
}
