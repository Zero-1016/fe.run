"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import toast from "react-hot-toast";

type PostMeta = { slug: string; title: string };

type Progress = { done: number; total: number; failed: number };

const postsPromise = import("#site/content").then((m) =>
  m.posts
    .filter((p: { published: boolean }) => p.published)
    .map((p: { slug: string; title: string }) => ({ slug: p.slug, title: p.title }))
);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
}

function subscribeNoop() {
  return () => {};
}

function getSupportedSnapshot(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "caches" in window
  );
}

function getSupportedServerSnapshot(): boolean | null {
  return null;
}

async function countCachedPosts(): Promise<number> {
  if (typeof caches === "undefined") return 0;
  const origin = typeof location !== "undefined" ? location.origin : "";
  const seen = new Set<string>();
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      const cache = await caches.open(key);
      const requests = await cache.keys();
      for (const req of requests) {
        try {
          const u = new URL(req.url);
          if (u.origin !== origin) continue;
          if (!u.pathname.startsWith("/posts/")) continue;
          seen.add(u.pathname);
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }
  return seen.size;
}

export function OfflineSection() {
  const supported = useSyncExternalStore(
    subscribeNoop,
    getSupportedSnapshot,
    getSupportedServerSnapshot
  );
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [status, setStatus] = useState<"idle" | "downloading" | "done" | "error">("idle");
  const [progress, setProgress] = useState<Progress>({ done: 0, total: 0, failed: 0 });
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const listenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const refreshTelemetry = useCallback(async () => {
    if (typeof navigator === "undefined") return;
    if ("storage" in navigator && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        setStorage({ usage: est.usage ?? 0, quota: est.quota ?? 0 });
      } catch {
        /* ignore */
      }
    }
    setCachedCount(await countCachedPosts());
  }, []);

  useEffect(() => {
    postsPromise.then(setPosts).catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    if (!supported) return;
    void Promise.resolve().then(refreshTelemetry);
  }, [supported, refreshTelemetry]);

  const handleDownload = async () => {
    if (!supported || posts.length === 0) return;

    const reg = await navigator.serviceWorker.getRegistration();
    const controller = navigator.serviceWorker.controller ?? reg?.active;
    if (!controller) {
      toast.error("Service Worker가 준비되지 않았어요. 페이지를 새로고침해 주세요.");
      return;
    }

    setStatus("downloading");
    setProgress({ done: 0, total: posts.length, failed: 0 });

    if (listenerRef.current) {
      navigator.serviceWorker.removeEventListener("message", listenerRef.current);
    }
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; done?: number; total?: number; failed?: number };
      if (!data || typeof data !== "object") return;
      if (data.type === "PRECACHE_PROGRESS" || data.type === "PRECACHE_COMPLETE") {
        setProgress({
          done: data.done ?? 0,
          total: data.total ?? posts.length,
          failed: data.failed ?? 0,
        });
      }
      if (data.type === "PRECACHE_COMPLETE") {
        const failed = data.failed ?? 0;
        const done = data.done ?? 0;
        setStatus(failed > 0 ? "error" : "done");
        toast.success(
          failed === 0
            ? `${done}개 글을 오프라인에서 읽을 수 있어요.`
            : `${done - failed}개 저장, ${failed}개 실패. 다시 시도해 주세요.`
        );
        void refreshTelemetry();
        navigator.serviceWorker.removeEventListener("message", onMessage);
        listenerRef.current = null;
      }
    };
    listenerRef.current = onMessage;
    navigator.serviceWorker.addEventListener("message", onMessage);

    const urls = posts.map((p) => `/posts/${p.slug}`);
    controller.postMessage({ type: "PRECACHE_DOCUMENTS", urls });
  };

  const handleClear = async () => {
    if (!supported) return;
    if (!window.confirm("저장된 오프라인 캐시를 모두 비울까요?")) return;
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      toast.success("캐시를 비웠어요.");
      setStatus("idle");
      setProgress({ done: 0, total: 0, failed: 0 });
      void refreshTelemetry();
    } catch {
      toast.error("캐시를 비우지 못했어요.");
    }
  };

  if (supported === null) {
    return null;
  }

  if (!supported) {
    return (
      <div className="rounded-2xl border border-border bg-background p-5 text-sm text-secondary dark:bg-[--color-bg-secondary]">
        이 브라우저는 오프라인 저장을 지원하지 않아요.
      </div>
    );
  }

  const total = posts.length;
  const cachedRatio = total > 0 ? Math.min(1, cachedCount / total) : 0;
  const storagePercent =
    storage && storage.quota > 0 ? Math.min(100, (storage.usage / storage.quota) * 100) : 0;
  const progressPercent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background dark:bg-[--color-bg-secondary]">
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-3">
        <Stat label="공개 글" value={total.toString()} />
        <Stat
          label="저장됨"
          value={`${cachedCount}`}
          suffix={total > 0 ? `/ ${total}` : undefined}
          accent={cachedRatio === 1 && total > 0}
        />
        <Stat
          className="col-span-2 border-t border-border sm:col-span-1 sm:border-t-0"
          label="사용 공간"
          value={storage ? formatBytes(storage.usage) : "—"}
          suffix={storage && storage.quota > 0 ? `/ ${formatBytes(storage.quota)}` : undefined}
        />
      </div>

      {storage && storage.quota > 0 && (
        <div className="px-4 pt-4 sm:px-5">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-secondary">
            <span>저장 공간</span>
            <span className="font-mono tabular-nums">{storagePercent.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${storagePercent}%` }}
              aria-hidden
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handleDownload}
            disabled={status === "downloading" || posts.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <DownloadIcon />
            {status === "downloading"
              ? `저장 중… ${progressPercent}%`
              : cachedCount >= total && total > 0
                ? "다시 동기화"
                : "전체 글 오프라인 저장"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={status === "downloading"}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-transparent px-3.5 py-2.5 text-sm font-medium text-secondary transition-colors hover:border-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
          >
            캐시 비우기
          </button>
        </div>

        {(status === "downloading" || status === "done" || status === "error") && (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-accent transition-[width] duration-200"
                style={{ width: `${progressPercent}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-2 font-mono text-xs tabular-nums text-secondary">
              {progress.done} / {progress.total}
              {progress.failed > 0 ? ` · 실패 ${progress.failed}` : ""}
            </p>
          </div>
        )}

        <p className="text-xs leading-relaxed text-secondary">
          저장된 글은 인터넷 없이도 읽을 수 있어요. 본문, 이미지, 스타일까지 함께 저장돼요.
          와이파이에서 진행하는 게 좋아요.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
  className,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3.5 sm:px-5 sm:py-4 ${className ?? ""}`}>
      <p className="text-[10px] uppercase tracking-wider text-secondary sm:text-[11px]">{label}</p>
      <p className="mt-1 font-mono text-base tabular-nums sm:text-lg">
        <span className={accent ? "text-accent" : ""}>{value}</span>
        {suffix && <span className="ml-1 text-xs text-secondary sm:text-sm">{suffix}</span>}
      </p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
