"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "recommend-bubble-dismissed";
const APPEAR_DELAY_MS = 1200;
const FADE_OUT_MS = 220;

export interface RecommendCandidate {
  slug: string;
  title: string;
  description: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RecommendBubble({ posts }: { posts: RecommendCandidate[] }) {
  const [order, setOrder] = useState<RecommendCandidate[]>([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (posts.length === 0) return;
    if (window.sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const appearTimer = window.setTimeout(() => {
      setOrder(shuffle(posts));
      setShown(true);
      requestAnimationFrame(() => setVisible(true));
    }, APPEAR_DELAY_MS);
    return () => window.clearTimeout(appearTimer);
  }, [posts]);

  if (!shown || order.length === 0) return null;

  const current = order[index];
  if (!current) return null;

  const handleDismiss = () => {
    setVisible(false);
    window.setTimeout(() => setShown(false), FADE_OUT_MS);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  const handleExpand = () => setExpanded(true);
  const handleCollapse = () => setExpanded(false);

  const handleNext = () => {
    setIndex((i) => (i + 1) % order.length);
  };

  return (
    <div
      className="pointer-events-none fixed right-4 top-20 z-40 sm:right-6"
      role="complementary"
      aria-label="추천 글"
    >
      <button
        type="button"
        onClick={handleExpand}
        aria-label={`추천 글 열기: ${current.title}`}
        aria-expanded={expanded}
        className="group/icon absolute right-0 top-0 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border bg-background/95 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.18)] backdrop-blur-sm hover:border-accent/60 dark:bg-[#111113]/95 dark:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.55)]"
        style={{
          opacity: visible && !expanded ? 1 : 0,
          transform: visible && !expanded ? "scale(1)" : "scale(0.85)",
          pointerEvents: visible && !expanded ? "auto" : "none",
          transition:
            "opacity 200ms ease-out, transform 200ms ease-out, border-color 160ms ease-out",
        }}
      >
        <span
          aria-hidden
          className="recommend-bubble__pulse pointer-events-none absolute -inset-px rounded-full border border-accent/55"
        />
        <span
          aria-hidden
          className="relative text-[13px] leading-none text-accent transition-transform group-hover/icon:scale-110"
        >
          ✦
        </span>
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-background dark:ring-[#111113]"
        />
      </button>

      <div
        className="absolute right-0 top-0 w-[min(20rem,calc(100vw-2rem))] origin-top-right"
        style={{
          opacity: visible && expanded ? 1 : 0,
          transform:
            visible && expanded ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
          pointerEvents: visible && expanded ? "auto" : "none",
          transition: "opacity 220ms ease-out, transform 220ms ease-out",
        }}
      >
        <div className="rounded-2xl border border-border bg-background/95 p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-[#111113]/95 dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-accent">
              <span aria-hidden>✦</span>이 글은 어떠세요?
            </span>
            <div className="-mt-1 -mr-1 flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleCollapse}
                aria-label="추천 접기"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-secondary transition-colors hover:bg-card-hover hover:text-foreground"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2 8l4-4 4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="추천 닫기"
                className="grid h-7 w-7 cursor-pointer place-items-center rounded-full text-secondary transition-colors hover:bg-card-hover hover:text-foreground"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <Link
            href={`/posts/${current.slug}`}
            className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
              {current.title}
            </h3>
            {current.description && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-secondary">
                {current.description}
              </p>
            )}
          </Link>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-secondary transition-colors hover:text-accent"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M2 4.5l2-2 2 2M10 7.5l-2 2-2-2M4 2.5v5a2 2 0 002 2M8 9.5v-5a2 2 0 00-2-2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              다른 글 추천
            </button>
            <Link
              href={`/posts/${current.slug}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
            >
              읽으러 가기
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path
                  d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
        <span
          aria-hidden
          className="absolute right-6 -top-[5px] h-[10px] w-[10px] rotate-45 border-t border-l border-border bg-background/95 dark:bg-[#111113]/95"
        />
      </div>
    </div>
  );
}
