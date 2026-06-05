import { HeroGraph } from "./hero-graph";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* 우측에 모이고 좌측으로 페이드되는 벡터 그래프 배경. 라이트/다크는 토큰으로 대응. */}
      <HeroGraph className="pointer-events-none absolute inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:py-24 md:py-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">갈리는 자리를 짚어요</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-secondary sm:mt-5 sm:text-lg">
          읽고 끝내는 대신, 코드로 직접 돌려보며 따라갑니다.
        </p>
      </div>
    </section>
  );
}
