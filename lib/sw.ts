/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope;

import { version } from "../package.json";
import { SW_PRECACHE_MOTIFS } from "./sw-precache.generated";

const CACHE_NAME = `tech-blog-v${version}`;

const PRECACHE_URLS = ["/", ...SW_PRECACHE_MOTIFS];

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

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
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

  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (!response.ok) {
          return response;
        }
        const cache = await caches.open(CACHE_NAME);
        const isDocumentNavigation =
          request.mode === "navigate" || request.destination === "document";

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
        return new Response("오프라인이며 캐시에 없습니다.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
  );
});
