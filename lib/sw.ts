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

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (!response.ok) {
          return response;
        }
        const cache = await caches.open(CACHE_NAME);

        if (isDocumentNavigation) {
          await cache.put(request, response.clone());
          await cache.put(corsDocumentRequest(request.url), response.clone());
        } else {
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(async () => {
        const cached = await matchCached(request);
        if (cached) {
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
      })
  );
});
