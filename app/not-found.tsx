import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없음",
  description: "요청한 주소에 해당하는 페이지가 없습니다.",
  robots: { index: false, follow: true },
  openGraph: {
    title: `페이지를 찾을 수 없음 | ${siteConfig.name}`,
    description: "요청한 주소에 해당하는 페이지가 없습니다.",
  },
};

export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-lg px-6 py-20 md:py-28">
      <div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl md:-left-32"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-accent/5 blur-3xl md:-right-28"
        aria-hidden
      />

      <div className="relative rounded-2xl border border-border bg-background/80 px-8 py-12 text-center shadow-sm backdrop-blur-sm dark:bg-[#111113]/80">
        <p
          className="font-mono text-7xl font-bold tabular-nums tracking-tighter text-accent/90 md:text-8xl"
          aria-hidden
        >
          404
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">길을 잃은 것 같아요</h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-secondary md:text-base">
          주소가 바뀌었거나, 삭제된 페이지일 수 있어요. 링크를 다시 확인하거나 아래에서 돌아가
          보세요.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            홈으로
          </Link>
          <Link
            href="/#posts"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/30 hover:text-accent dark:bg-[#111113]"
          >
            글 목록
          </Link>
        </div>
      </div>
    </div>
  );
}
