import { Reveal, RevealWords } from "@/components/motion/reveal";

export function PageHead({
  eyebrow,
  index,
  title,
  text,
}: {
  eyebrow: string;
  index?: string;
  title: string;
  text?: string;
}) {
  return (
    <section className="pb-[clamp(40px,7vh,80px)] pt-[calc(72px+clamp(60px,12vh,140px))]">
      <div className="container-edge">
        <div className="mb-[clamp(28px,5vh,56px)] flex items-baseline justify-between border-t border-rule pt-5">
          <Reveal kind="fade" as="span" className="eyebrow">
            {eyebrow}
          </Reveal>
          {index ? (
            <Reveal kind="fade" as="span" className="eyebrow">
              {index}
            </Reveal>
          ) : null}
        </div>

        <RevealWords as="h1" className="statement max-w-[16ch]" text={title} />

        {text ? (
          <Reveal delay={0.18}>
            <p className="copy ml-auto mt-[clamp(24px,4vh,44px)] max-w-[48ch] max-md:ml-0">
              {text}
            </p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
