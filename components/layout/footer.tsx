import Link from "next/link";

// 크롤러가 전체 글·태그·시리즈로 들어가는 유일한 상시 링크. 홈은 최근 16편만
// <a> 로 렌더하고 /tags 와 /series 는 어디서도 링크되지 않아서, 이 줄이 빠지면
// 대부분의 목록 페이지가 sitemap 으로만 도달 가능해진다.
const NAV = [
  { href: "/posts", label: "전체 글" },
  { href: "/tags", label: "태그" },
  { href: "/series", label: "시리즈" },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-sm text-secondary">
        <nav aria-label="사이트 링크">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/feed.xml" className="transition-colors hover:text-accent">
                RSS
              </a>
            </li>
          </ul>
        </nav>
        <p>© 2026 Zero-1016</p>
      </div>
    </footer>
  );
}
