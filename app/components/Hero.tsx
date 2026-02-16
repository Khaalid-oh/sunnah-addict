"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export type HeroSlide = {
  src: string;
  alt: string;
};

type HeroProps = {
  pretitle?: string;
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Single image (legacy); ignored if slides is provided */
  imageSrc?: string;
  imageAlt?: string;
  /** Slideshow: array of { src, alt }. Takes precedence over imageSrc */
  slides?: HeroSlide[];
  /** Auto-advance interval in ms (default 5000). Set 0 to disable */
  slideInterval?: number;
};

export default function Hero({
  pretitle = "RESORT 20/25",
  title = "SUNNAH ADDICT",
  ctaLabel = "SHOP NOW",
  ctaHref = "/collections",
  imageSrc,
  imageAlt = "Modest wear hijab collection",
  slides,
  slideInterval = 5000,
}: HeroProps) {
  const effectiveSlides: HeroSlide[] = slides?.length
    ? slides
    : imageSrc
      ? [{ src: imageSrc, alt: imageAlt }]
      : [];

  const [current, setCurrent] = useState(0);
  const isSlideshow = effectiveSlides.length > 1;

  const goTo = useCallback(
    (index: number) => {
      const next = index % effectiveSlides.length;
      setCurrent(next < 0 ? effectiveSlides.length + next : next);
    },
    [effectiveSlides.length],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    if (!isSlideshow || slideInterval <= 0) return;
    const id = setInterval(next, slideInterval);
    return () => clearInterval(id);
  }, [isSlideshow, slideInterval, next]);

  return (
    <section
      className="relative min-h-[84vh] w-full overflow-hidden bg-zinc-200"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0">
        {effectiveSlides.length > 0 ? (
          <>
            {effectiveSlides.map((slide, i) => (
              <div
                key={`${slide.src}-${i}`}
                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                style={{
                  opacity: i === current ? 1 : 0,
                  zIndex: i === current ? 1 : 0,
                }}
                {...(i !== current
                  ? { "aria-hidden": "true" }
                  : { "aria-hidden": "false" })}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority
                />
              </div>
            ))}
          </>
        ) : (
          <div className="h-full w-full bg-linear-to-b from-zinc-300 to-zinc-400" />
        )}
        <div className="absolute inset-0 z-10 bg-black/30" aria-hidden="true" />
      </div>

      {isSlideshow && (
        <div
          className="absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2"
          role="tablist"
          aria-label="Slideshow"
        >
          {effectiveSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              {...(i === current
                ? { "aria-selected": "true" }
                : { "aria-selected": "false" })}
              aria-label={`Slide ${i + 1}`}
              className="h-2 w-2 rounded-full bg-white/80 transition-all duration-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
              style={{
                width: i === current ? "1.5rem" : undefined,
                opacity: i === current ? 1 : 0.7,
              }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}

      <div className="relative z-30 flex min-h-[70vh] flex-col items-center justify-end pb-4 pt-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-tighter text-zinc-200">
          {pretitle}
        </p>
        <h1
          id="hero-title"
          className="mb-6 text-md font-medium uppercase tracking-widest text-white"
        >
          {title}
        </h1>
        <a
          href={ctaHref}
          className="inline-flex items-center justify-center border-2 border-white bg-white px-8 py-3 text-xs font-medium uppercase tracking-widest text-black transition hover:bg-transparent hover:text-white"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
