/// <reference lib="webworker" />
/** 문서는 네트워크 우선 + HTML·/_next/static 묶음 캐시. 메모: docs/service-worker-caching.md */

export {};

declare const self: ServiceWorkerGlobalScope;

import { version } from "../package.json";
import { SW_OFFLINE_HTML_INLINE } from "./sw-offline-html.generated";
import { SW_PRECACHE_MOTIFS } from "./sw-precache.generated";

/** 캐시 스키마 버전. TTL 도입으로 옛 캐시를 한 번 비우려고 접미사(-ttl)를 올렸다. */
const CACHE_NAME = `tech-blog-v${version}-ttl`;

/** 런타임 캐시(문서·번들) 보관 기간 1주일. 지난 항목은 제공하지 않고 청소한다. 프리캐시 셸은 만료 없음. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
/** 캐시한 시각을 적는 헤더. 이 헤더가 없으면 영구(오프라인 셸)로 본다. */
const CACHED_AT_HEADER = "x-sw-cached-at";

const PRECACHE_URLS = ["/", "/offline.html", ...SW_PRECACHE_MOTIFS];

/** 마지막 청소 시각. 워커가 살아 있는 동안 유지되는 스로틀(자주 전수 검사하지 않도록). */
let lastSweepAt = 0;
const SWEEP_THROTTLE_MS = 60 * 60 * 1000;

/** 프리페치 `fetch(url)`은 mode가 cors, 문서 이동은 navigate라 캐시 키가 달라진다. cors 키로도 저장·조회한다. */
function corsDocumentRequest(url: string): Request {
  return new Request(url, {
    method: "GET",
    credentials: "same-origin",
    mode: "cors",
  });
}

/** 응답에 캐시 시각 헤더를 붙여 새 Response로 만든다(동일 출처 문서·번들 전용). */
async function withTimestamp(response: Response): Promise<Response> {
  const headers = new Headers(response.headers);
  headers.set(CACHED_AT_HEADER, String(Date.now()));
  const body = await response.clone().blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** 캐시 시각 헤더가 있고 MAX_AGE_MS를 넘겼으면 만료. 헤더가 없으면(프리캐시 셸) 영구. */
function isStale(response: Response): boolean {
  const at = response.headers.get(CACHED_AT_HEADER);
  if (!at) return false;
  const cachedAt = Number(at);
  if (!Number.isFinite(cachedAt)) return false;
  return Date.now() - cachedAt > MAX_AGE_MS;
}

/** 문서 응답을 navigate 키와 cors 키 양쪽에 시각 도장을 찍어 저장한다. */
async function cacheDocument(cache: Cache, request: Request, response: Response): Promise<void> {
  const stamped = await withTimestamp(response);
  await cache.put(request, stamped.clone());
  await cache.put(corsDocumentRequest(request.url), stamped.clone());
}

/** 만료된 런타임 캐시 항목을 삭제한다. 헤더 없는 프리캐시 셸은 건드리지 않는다. */
async function sweepStale(): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  for (const req of requests) {
    const res = await cache.match(req);
    if (res && isStale(res)) {
      await cache.delete(req);
    }
  }
}

/** 스로틀이 지났을 때만 전수 청소한다. fetch 경로에서 가볍게 호출하기 위함. */
function maybeSweep(): Promise<void> {
  const now = Date.now();
  if (now - lastSweepAt < SWEEP_THROTTLE_MS) return Promise.resolve();
  lastSweepAt = now;
  return sweepStale();
}

async function matchCached(request: Request): Promise<Response | undefined> {
  const direct = await caches.match(request);
  if (direct && !isStale(direct)) return direct;
  const cors = await caches.match(corsDocumentRequest(request.url));
  if (cors && !isStale(cors)) return cors;
  return undefined;
}

/** HTML에 등장하는 동일 출처 `/_next/static/*` 경로(쿼리 포함) */
function extractNextStaticRefsFromHtml(html: string): string[] {
  const paths = new Set<string>();
  const origin = self.location.origin;

  const linkRe = /<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  const scriptRe = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;

  for (const re of [linkRe, scriptRe]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const raw = m[1];
      if (!raw) continue;
      try {
        const u = new URL(raw, origin);
        if (u.origin !== self.location.origin) continue;
        if (!u.pathname.startsWith("/_next/static/")) continue;
        paths.add(u.pathname + u.search);
      } catch {
        /* ignore */
      }
    }
  }

  return Array.from(paths);
}

async function precacheNextStaticBundle(paths: readonly string[]): Promise<void> {
  const unique = Array.from(new Set(paths)).slice(0, 80);
  if (unique.length === 0) return;
  const cache = await caches.open(CACHE_NAME);
  await precacheRuntime(cache, unique);
}

/** 캐시된 문서 HTML이 가리키는 `/_next/static` 자산이 모두 캐시에 있을 때만 true */
async function documentBundleFullyCached(cachedDocument: Response): Promise<boolean> {
  let html: string;
  try {
    html = await cachedDocument.clone().text();
  } catch {
    return false;
  }

  const paths = extractNextStaticRefsFromHtml(html);
  if (paths.length === 0) {
    return false;
  }

  for (const path of paths) {
    const url = new URL(path, self.location.origin).href;
    const hit = await matchCached(new Request(url));
    if (!hit) return false;
  }

  return true;
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

/** 런타임 자산 프리캐시. precacheEach와 달리 시각 도장을 찍어 1주일 후 만료되게 한다. */
async function precacheRuntime(cache: Cache, urls: readonly string[]): Promise<void> {
  for (const path of urls) {
    try {
      const request = new Request(path, { credentials: "same-origin" });
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, await withTimestamp(response));
      }
    } catch {
      /* 개별 자산 실패는 무시 */
    }
  }
}

/** 클라이언트가 요청한 문서 URL들을 미리 캐시. fetch 리스너의 navigate 분기와 동일하게 HTML + /_next/static 번들을 묶음 캐시한다. */
async function precacheDocuments(
  urls: readonly string[],
  source: Client | MessagePort | ServiceWorker | null
): Promise<void> {
  const targets = Array.from(
    new Set(
      urls
        .map((raw) => {
          try {
            const u = new URL(raw, self.location.origin);
            if (u.origin !== self.location.origin) return null;
            return u.pathname + u.search;
          } catch {
            return null;
          }
        })
        .filter((u): u is string => Boolean(u))
    )
  );

  const total = targets.length;
  let done = 0;
  let failed = 0;
  const cache = await caches.open(CACHE_NAME);

  const notify = (type: "PRECACHE_PROGRESS" | "PRECACHE_COMPLETE") => {
    try {
      source?.postMessage({ type, done, total, failed });
    } catch {
      /* ignore */
    }
  };

  for (const path of targets) {
    try {
      const request = new Request(path, { credentials: "same-origin" });
      const response = await fetch(request);
      if (response.ok) {
        const html = await response.clone().text();
        await cacheDocument(cache, request, response);
        await precacheNextStaticBundle(extractNextStaticRefsFromHtml(html));
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
    done += 1;
    notify("PRECACHE_PROGRESS");
  }

  notify("PRECACHE_COMPLETE");
}

async function cacheRuntimeUrls(urls: readonly string[]): Promise<void> {
  const normalized = urls
    .map((u) => {
      try {
        const url = new URL(u, self.location.origin);
        if (url.origin !== self.location.origin) return null;
        if (!url.pathname.startsWith("/_next/static/")) return null;
        if (!/\.(css|js)$/.test(url.pathname)) return null;
        return url.pathname + url.search;
      } catch {
        return null;
      }
    })
    .filter((u): u is string => Boolean(u));

  if (normalized.length === 0) return;

  const unique = Array.from(new Set(normalized)).slice(0, 24);
  const cache = await caches.open(CACHE_NAME);
  await precacheRuntime(cache, unique);
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
      await sweepStale();
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
  if (type === "PRECACHE_DOCUMENTS") {
    const urls = "urls" in data ? (data as { urls?: unknown }).urls : undefined;
    if (Array.isArray(urls) && urls.every((u) => typeof u === "string")) {
      void precacheDocuments(urls, event.source);
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
            const bundleOk = await documentBundleFullyCached(cached);
            if (!bundleOk) {
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

  // 문서(HTML) 이동: 네트워크 우선(SWR 미적용). 성공 시 HTML + 본문이 가리키는 /_next/static 묶음 캐시. 실패 시 번들이 맞는 캐시만.
  if (isDocumentNavigation) {
    event.waitUntil(maybeSweep());
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const html = await response.clone().text();
            const cache = await caches.open(CACHE_NAME);
            await cacheDocument(cache, request, response);
            await precacheNextStaticBundle(extractNextStaticRefsFromHtml(html));
          }
          return response;
        } catch {
          const cached = await matchCached(request);
          if (cached && (await documentBundleFullyCached(cached))) {
            return cached;
          }
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
        await cache.put(request, await withTimestamp(response));
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
