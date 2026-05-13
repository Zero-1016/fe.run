import Image from "next/image";

export function Hero() {
  return (
    <section className="border-b border-border">
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-6 py-16 sm:py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10 md:py-28">
        <div className="relative z-10">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            갈리는 자리를 짚어요
          </h1>
          <p className="mt-4 text-base leading-relaxed text-secondary sm:mt-5 sm:text-lg">
            코드를 짜다 마주친 궁금한 것들을 하나씩 따라가며 정리합니다.
          </p>
        </div>
        <div className="relative aspect-16/5 w-full overflow-hidden max-md:pointer-events-none max-md:absolute max-md:inset-0 max-md:z-0 max-md:aspect-auto max-md:opacity-25">
          <Image
            fetchPriority="high"
            src="/banners/home/hero_background.png"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover object-right invert dark:invert-0"
          />
        </div>
      </div>
    </section>
  );
}
