"use client";

import { useEffect, useRef } from "react";

import { useIsOnline } from "@/lib/use-is-online";

export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const isOnline = useIsOnline();

  useEffect(() => {
    if (!ref.current || ref.current.querySelector(".giscus")) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", process.env.NEXT_PUBLIC_GISCUS_REPO ?? "");
    script.setAttribute("data-repo-id", process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "");
    script.setAttribute("data-category", "Comments");
    script.setAttribute("data-category-id", process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "ko");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current.appendChild(script);
  }, []);

  // giscus 미설정 시 렌더링 안 함
  if (!process.env.NEXT_PUBLIC_GISCUS_REPO) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="relative min-h-[180px]">
        <div
          ref={ref}
          className={
            isOnline ? "" : "pointer-events-none select-none blur-sm transition duration-200"
          }
          aria-hidden={!isOnline}
        />
        {!isOnline && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 flex items-start justify-center pt-10"
          >
            <div className="max-w-sm rounded-lg border border-border bg-background/85 px-5 py-4 text-center shadow-sm backdrop-blur">
              <p className="text-sm font-semibold">오프라인 상태예요</p>
              <p className="mt-1 text-sm text-secondary">인터넷에 연결해주세요.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
