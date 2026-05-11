"use client";

import { useEffect } from "react";

function isHttpSameOrigin(href: string, origin: string): boolean {
  try {
    const u = new URL(href, origin);
    return u.origin === origin && (u.protocol === "http:" || u.protocol === "https:");
  } catch {
    return false;
  }
}

/**
 * 오프라인에서 Next 클라이언트 라우팅(RSC)이 실패하는 문제를 줄이기 위해
 * 같은 출처 링크는 전체 문서 로드로 보낸다. SW가 문서/HTML·offline 폴백을 적용할 수 있게 한다.
 */
export function OfflineFullNavigation() {
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (navigator.onLine) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const el = e.target;
      if (!(el instanceof Element)) return;
      const anchor = el.closest("a[href]");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const raw = anchor.getAttribute("href");
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
        return;
      }

      if (!isHttpSameOrigin(anchor.href, window.location.origin)) return;

      const next = new URL(anchor.href);
      const now = new URL(window.location.href);
      if (next.pathname === now.pathname && next.search === now.search) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      window.location.assign(anchor.href);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, []);

  return null;
}
