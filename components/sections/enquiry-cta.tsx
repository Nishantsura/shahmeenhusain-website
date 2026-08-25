"use client";

import Image from "next/image";
import { useState } from "react";

import { Reveal, RevealWords } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Channel = "email" | "call";

/**
 * Closing enquiry block.
 *
 * The channel toggle swaps which field is asked for — the reference does
 * the same, and it keeps the form to two inputs instead of four.
 *
 * NOT WIRED UP: like the contact form and the newsletter, this posts
 * nowhere. It needs a real endpoint before launch.
 */
export function EnquiryCta({ image }: { image?: string }) {
  const [channel, setChannel] = useState<Channel>("email");

  return (
    <section className="gutter flex flex-col gap-[clamp(2.5rem,5vw,4.4rem)] bg-paper pb-[clamp(2rem,3vw,2.2rem)] pt-[clamp(3rem,6vw,4.4rem)] md:pr-[70px]">
      <Reveal as="h2" kind="fade" className="statement md:w-[78%]">
        Tell us about the occasion, the idea, or just the fabric you cannot stop thinking about
      </Reveal>

      <div className="flex flex-col items-end gap-[clamp(2rem,4vw,3.1rem)] md:flex-row">
        <div className="flex w-full flex-col justify-end gap-[clamp(2rem,4vw,3.1rem)] md:w-1/2">
          <div className="flex flex-col gap-2.5">
            <RevealWords
              as="p"
              className="grotesk-sm text-ink"
              text="Most of our best work starts with a client who cannot quite put their finger on it. Turning that into a drawing, and the drawing into a fitting, is the part we are good at."
            />
            <Reveal as="p" kind="rise" delay={0.12} className="grotesk-sm mt-6 text-ink">
              How would you like us to get in touch?
            </Reveal>
          </div>

          <Reveal kind="rise" delay={0.18} className="w-full">
            <form
              className="flex w-full flex-col gap-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-5">
                  {(["email", "call"] as const).map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-1.5 font-body text-tag uppercase text-ink"
                    >
                      <input
                        type="radio"
                        name="channel"
                        value={value}
                        checked={channel === value}
                        onChange={() => setChannel(value)}
                        className="sr-only"
                      />
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-brand">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full bg-brand transition-opacity",
                            channel === value ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </span>
                      {value}
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="rounded-[10px] px-4 py-2 font-body text-tag uppercase text-ink transition-colors hover:text-brand"
                >
                  Send
                </button>
              </div>

              <Field placeholder="Your name" name="name" autoComplete="name" />
              {channel === "email" ? (
                <Field placeholder="Your email" name="email" type="email" autoComplete="email" />
              ) : (
                <Field placeholder="Your number" name="phone" type="tel" autoComplete="tel" />
              )}
            </form>
          </Reveal>
        </div>

        {image ? (
          <Reveal kind="fade" delay={0.1} className="w-full md:w-1/2">
            <div className="relative aspect-[534/360] w-full overflow-hidden">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function Field(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className="h-[51px] w-full rounded-[35px] bg-brand/5 px-6 font-body text-tag uppercase text-ink outline-none placeholder:text-ink/40 focus:bg-brand/10"
    />
  );
}
