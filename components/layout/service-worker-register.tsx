"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const OFFLINE_TOAST_SHOWN_SESSION_KEY = "offline-toast-shown";
const NEXT_STATIC_WARMED_SESSION_KEY = "sw-next-static-warmed";
const WARM_CACHE_DELAY_MS = 900;
const OFFLINE_TOAST_DURATION_MS = 5000;
const OFFLINE_TOAST_ID = "offline-status";

function collectNextStaticCssUrls(): string[] {
  const urls = new Set<string>();

  for (const el of Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
  )) {
    const href = el.href;
    if (!href) continue;
    if (!href.includes("/_next/static/")) continue;
    if (!href.includes(".css")) continue;
    urls.add(href);
  }

  return Array.from(urls);
}

export function ServiceWorkerRegister() {
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {})
        .catch(() => {
          // ignore
        });
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!navigator.serviceWorker.controller) return;
    if (!navigator.onLine) return;

    try {
      if (window.sessionStorage.getItem(NEXT_STATIC_WARMED_SESSION_KEY) === "1") return;
      window.sessionStorage.setItem(NEXT_STATIC_WARMED_SESSION_KEY, "1");
    } catch {
      // ignore
    }

    const id = window.setTimeout(() => {
      const urls = collectNextStaticCssUrls();
      if (urls.length === 0) return;
      try {
        navigator.serviceWorker.controller?.postMessage({ type: "CACHE_URLS", urls });
      } catch {
        // ignore
      }
    }, WARM_CACHE_DELAY_MS);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const showOfflineToastOnce = () => {
      if (navigator.onLine) return;
      if (hasShownToastRef.current) return;

      try {
        if (window.sessionStorage.getItem(OFFLINE_TOAST_SHOWN_SESSION_KEY) === "1") {
          hasShownToastRef.current = true;
          return;
        }
        window.sessionStorage.setItem(OFFLINE_TOAST_SHOWN_SESSION_KEY, "1");
      } catch {
        // sessionStorage 불가 시 ref 만으로 게이팅
      }

      hasShownToastRef.current = true;
      toast("✈️ 인터넷 없이 읽는 중이에요", {
        id: OFFLINE_TOAST_ID,
        duration: OFFLINE_TOAST_DURATION_MS,
      });
    };

    showOfflineToastOnce();

    const handleOffline = () => showOfflineToastOnce();
    const handleOnline = () => toast.dismiss(OFFLINE_TOAST_ID);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // 오프라인 토스트는 전역 Toaster에서 렌더링한다.
  // 여기서는 SW 등록/캐시 워밍/업데이트 감지만 수행한다.
  return null;
}
