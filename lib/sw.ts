/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope;

import { version } from "../package.json";
import { SW_OFFLINE_HTML_INLINE } from "./sw-offline-html.generated";
import { SW_PRECACHE_MOTIFS } from "./sw-precache.generated";

const CACHE_NAME = `tech-blog-v${version}`;

const PRECACHE_URLS = ["/", "/offline.html", ...SW_PRECACHE_MOTIFS];

/** 프리페치 `fetch(url)`은 mode가 cors, 문서 이동은 navigate라 캐시 키가 달라진다. cors 키로도 저장·조회한다. */
function corsDocumentRequest(url: string): Request {
  return new Request(url, {
    method: "GET",
    credentials: "same-origin",
    mode: "cors",
  });
}

async function matchCached(request: Request): Promise<Response | undefined> {
  return (await caches.match(request)) ?? (await caches.match(corsDocumentRequest(request.url)));
}

async function hasAnyNextStaticCached(): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.some((req) => {
      try {
        const url = new URL(req.url);
        return url.origin === self.location.origin && url.pathname.startsWith("/_next/static/");
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

async function offlineDocumentResponse(): Promise<Response> {
  const offlineUrl = `${self.location.origin}/offline.html`;
  const cached =
    (await caches.match(corsDocumentRequest(offlineUrl))) ??
    (await caches.match(new Request(offlineUrl)));
  if (cached) {
    return cached;
  }
  return new Response(SW_OFFLINE_HTML_INLINE, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function precacheEach(cache: Cache, urls: readonly string[]): Promise<void> {
  for (const path of urls) {
    try {
      await cache.add(path);
    } catch {
      /* 개별 자산 실패는 무시 (addAll 전체 실패 방지) */
    }
  }
}

async function cacheRuntimeUrls(urls: readonly string[]): Promise<void> {
  const normalized = urls
    .map((u) => {
      try {
        const url = new URL(u, self.location.origin);
        if (url.origin !== self.location.origin) return null;
        if (!url.pathname.startsWith("/_next/static/")) return null;
        if (!url.pathname.endsWith(".css")) return null;
        return url.pathname + url.search;
      } catch {
        return null;
      }
    })
    .filter((u): u is string => Boolean(u));

  if (normalized.length === 0) return;

  const unique = Array.from(new Set(normalized)).slice(0, 12);
  const cache = await caches.open(CACHE_NAME);
  await precacheEach(cache, unique);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await precacheEach(cache, PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

/** 업데이트 알림 토스트에서 즉시 적용을 요청할 때 사용 */
self.addEventListener("message", (event) => {
  const data = event.data as unknown;
  if (!data || typeof data !== "object") return;
  const type = "type" in data ? (data as { type?: unknown }).type : undefined;
  if (type === "SKIP_WAITING") void self.skipWaiting();
  if (type === "CACHE_URLS") {
    const urls = "urls" in data ? (data as { urls?: unknown }).urls : undefined;
    if (Array.isArray(urls) && urls.every((u) => typeof u === "string")) {
      void cacheRuntimeUrls(urls);
    }
  }
});

/** 온라인: 네트워크 우선 후 캐시 갱신. 오프라인·실패 시 캐시. */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isDocumentNavigation = request.mode === "navigate" || request.destination === "document";

  /** fetch를 건너뛰면 Network 탭에 net::ERR_INTERNET_DISCONNECTED 행이 쌓이지 않음 */
  if (!self.navigator.onLine) {
    event.respondWith(
      (async () => {
        const cached = await matchCached(request);
        if (cached) {
          if (isDocumentNavigation) {
            const hasNextStatic = await hasAnyNextStaticCached();
            if (!hasNextStatic) {
              return offlineDocumentResponse();
            }
          }
          return cached;
        }
        if (isDocumentNavigation) {
          return offlineDocumentResponse();
        }
        return new Response("오프라인이며 캐시에 없습니다.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })()
    );
    return;
  }

  // 문서(HTML) 이동은 SWR: 캐시 즉시 반환 + 백그라운드 갱신
  if (isDocumentNavigation) {
    event.respondWith(
      (async () => {
        const cached = await matchCached(request);

        const updateCache = (async () => {
          try {
            const response = await fetch(request);
            if (!response.ok) return;
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
            await cache.put(corsDocumentRequest(request.url), response.clone());
          } catch {
            // ignore
          }
        })();

        event.waitUntil(updateCache);

        if (cached) {
          return cached;
        }

        // 캐시가 없으면 네트워크 결과를 기다렸다가, 실패 시 오프라인 페이지로
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
            await cache.put(corsDocumentRequest(request.url), response.clone());
          }
          return response;
        } catch {
          return offlineDocumentResponse();
        }
      })()
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (!response.ok) {
          return response;
        }
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      })
      .catch(async () => {
        const cached = await matchCached(request);
        if (cached) {
          return cached;
        }
        return new Response("오프라인이며 캐시에 없습니다.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
  );
});
