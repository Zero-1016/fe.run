"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

interface FAQItem {
  question: string;
  answer: ReactNode;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function FAQ({
  title = "자주 묻는 질문",
  subtitle = "답을 펼치기 전에 스스로 답해보세요",
  items,
}: FAQProps) {
  const baseId = useId();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: extractText(item.answer).replace(/\s+/g, " ").trim(),
      },
    })),
  };

  // 모바일은 항상 펼침. 데스크톱은 기본 닫힘 + 클릭으로 토글.
  // SSR/초기 렌더는 펼친 상태로 그려 크롤러·스크린리더·no-JS에 본문을 노출하고,
  // 마운트 후 데스크톱에서만 닫는다. animate 플래그로 첫 접힘은 애니메이션 없이 처리.
  const [isDesktop, setIsDesktop] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => {
      mq.removeEventListener("change", apply);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toggle = (i: number) => {
    if (!isDesktop) return;
    setOpenSet((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i);
      else s.add(i);
      return s;
    });
  };

  return (
    <section className="not-prose my-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="mb-1! text-foreground">{title}</h2>
      {subtitle ? <p className="mb-4 text-sm text-secondary/60">{subtitle}</p> : null}
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const open = isDesktop ? openSet.has(i) : true;
          const panelId = `${baseId}-panel-${i}`;
          const btnId = `${baseId}-btn-${i}`;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-card-hover/40 transition-colors md:hover:border-accent/40"
            >
              <button
                type="button"
                id={btnId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="pointer-events-none flex w-full cursor-default items-center justify-between gap-3 px-4 py-3.5 text-left text-base font-medium text-foreground md:pointer-events-auto md:cursor-pointer"
              >
                {item.question}
                <svg
                  aria-hidden
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`hidden h-4 w-4 shrink-0 text-secondary transition-transform duration-300 ease-out md:block ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                inert={!open ? true : undefined}
                className={`grid ${animate ? "transition-[grid-template-rows] duration-300 ease-out" : ""} ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`px-4 pb-4 text-sm leading-7 text-secondary transition-opacity duration-200 ${
                      open ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
