import Link from "next/link";
import { headers } from "next/headers";
import { ThemeToggle } from "./theme-toggle";
import { SearchButton } from "./search-button";
import { SettingsIcon } from "./icons/settings-icon";

export async function Header() {
  const ua = (await headers()).get("user-agent") ?? "";
  const isMac = /mac/i.test(ua);
  const isMobile = /android|iphone|ipad|ipod/i.test(ua);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {/* 브랜드 마크. favicon.svg 와 동일한 노드 그래프 모티프로 탭/홈 아이콘과 일관성 유지 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.svg"
            alt=""
            aria-hidden="true"
            width={28}
            height={28}
            className="rounded-[7px]"
          />
          fe.run
        </Link>
        <div className="flex items-center gap-1">
          <SearchButton isMac={isMac} isMobile={isMobile} />
          <Link
            href="/settings"
            aria-label="설정"
            className="rounded-lg p-2 text-secondary transition-colors hover:bg-card-hover"
          >
            <SettingsIcon />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
