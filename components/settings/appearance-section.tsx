"use client";

import { useCallback, useSyncExternalStore } from "react";

type ThemeMode = "system" | "light" | "dark";

function readThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem("theme");
  if (value === "dark" || value === "light") return value;
  return "system";
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerMode(): ThemeMode {
  return "system";
}

const MODES: { id: ThemeMode; label: string; icon: typeof SystemIcon }[] = [
  { id: "system", label: "시스템", icon: SystemIcon },
  { id: "light", label: "라이트", icon: SunIcon },
  { id: "dark", label: "다크", icon: MoonIcon },
];

export function AppearanceSection() {
  const mode = useSyncExternalStore(subscribeTheme, readThemeMode, getServerMode);

  const setMode = useCallback((next: ThemeMode) => {
    if (next === "system") {
      window.localStorage.removeItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      window.localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-background p-5 dark:bg-[--color-bg-secondary]">
      <p className="text-[11px] uppercase tracking-wider text-secondary">테마</p>
      <div
        role="radiogroup"
        aria-label="테마 선택"
        className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-border bg-background p-1"
      >
        {MODES.map(({ id, label, icon: Icon }) => {
          const selected = mode === id;
          return (
            <button
              key={id}
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(id)}
              className={`relative inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "bg-card-hover text-foreground shadow-[inset_0_0_0_1px_var(--color-border)]"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-secondary">
        시스템을 선택하면 OS 설정을 따라가요. 이 페이지 상단의 토글로도 라이트/다크를 바꿀 수
        있어요.
      </p>
    </div>
  );
}

function SystemIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
