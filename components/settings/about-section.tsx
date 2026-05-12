"use client";

import { useSyncExternalStore } from "react";

type SwState = "unsupported" | "missing" | "registered" | "active";

function subscribeSw(callback: () => void) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return () => {};
  const handler = () => callback();
  navigator.serviceWorker.addEventListener("controllerchange", handler);
  return () => navigator.serviceWorker.removeEventListener("controllerchange", handler);
}

function getSwSnapshot(): SwState {
  if (typeof navigator === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator)) return "unsupported";
  if (navigator.serviceWorker.controller) return "active";
  return "registered";
}

function getSwServerSnapshot(): SwState {
  return "missing";
}

const STATE_LABELS: Record<SwState, { label: string; tone: "ok" | "warn" | "muted" }> = {
  unsupported: { label: "지원 안 함", tone: "warn" },
  missing: { label: "확인 중…", tone: "muted" },
  registered: { label: "등록됨 (대기)", tone: "muted" },
  active: { label: "활성 · 오프라인 사용 가능", tone: "ok" },
};

type Props = {
  version: string;
  siteName: string;
  author: string;
  githubUrl: string;
};

export function AboutSection({ version, siteName, author, githubUrl }: Props) {
  const sw = useSyncExternalStore(subscribeSw, getSwSnapshot, getSwServerSnapshot);
  const swMeta = STATE_LABELS[sw];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background dark:bg-[--color-bg-secondary]">
      <dl className="divide-y divide-border">
        <Row label="이름" value={siteName} mono />
        <Row label="버전" value={`v${version}`} mono />
        <Row label="Service Worker">
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-sm ${
              swMeta.tone === "ok"
                ? "text-accent"
                : swMeta.tone === "warn"
                  ? "text-secondary"
                  : "text-secondary"
            }`}
          >
            <span
              aria-hidden
              className={`inline-block size-1.5 rounded-full ${
                swMeta.tone === "ok"
                  ? "bg-accent shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
                  : "bg-secondary/40"
              }`}
            />
            {swMeta.label}
          </span>
        </Row>
        <Row label="제작">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-sm text-secondary transition-colors hover:text-accent"
          >
            @{author}
          </a>
        </Row>
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
      <dt className="text-[10px] uppercase tracking-wider text-secondary sm:text-[11px]">
        {label}
      </dt>
      <dd className={`${mono ? "font-mono " : ""}text-sm sm:text-right`}>{children ?? value}</dd>
    </div>
  );
}
