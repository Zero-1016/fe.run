"use client";

import { useEffect, useRef } from "react";

import { useIsOnline } from "@/lib/use-is-online";

// 사이트 테마 신호를 읽어 giscus 테마로 변환.
// <html>.dark 클래스는 하이드레이션 도중 일시적으로 비워질 수 있어
// (ThemeToggle 의 useSyncExternalStore 초기 스냅샷이 light) giscus 가 잘못된
// 테마로 로드된다. 그래서 클래스가 아니라 소스 오브 트루스(localStorage +
// prefers-color-scheme)를 직접 읽는다. ThemeToggle 의 판단 기준과 동일.
function getGiscusTheme() {
  const stored = localStorage.getItem("theme");
  const dark =
    stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return dark ? "dark" : "light";
}

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
    script.setAttribute("data-theme", getGiscusTheme());
    script.setAttribute("data-lang", "ko");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current.appendChild(script);
  }, []);

  // 사이트 테마 토글에 맞춰 giscus iframe 테마를 동기화
  useEffect(() => {
    function syncTheme() {
      const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: getGiscusTheme() } } },
        "https://giscus.app"
      );
    }

    // 1) 사이트 테마 토글 시 동기화
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 2) giscus 로드(fetching) 완료 시 현재 테마로 재동기화.
    //    초기 로드 중에는 iframe 이 아직 메시지를 듣지 않아 setConfig 가 유실된다.
    //    giscus 는 준비되면 부모 창에 메시지를 보내므로, 그 시점에 다시 보낸다.
    function onGiscusMessage(event: MessageEvent) {
      if (event.origin !== "https://giscus.app") return;
      const data = event.data as { giscus?: Record<string, unknown> } | null;
      if (!data?.giscus) return;
      // 높이 변동(resize)만 알리는 메시지는 무시하고, 로드/상태 변경에만 재동기화
      if ("resizeHeight" in data.giscus && Object.keys(data.giscus).length === 1) return;
      syncTheme();
    }
    window.addEventListener("message", onGiscusMessage);

    return () => {
      observer.disconnect();
      window.removeEventListener("message", onGiscusMessage);
    };
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
