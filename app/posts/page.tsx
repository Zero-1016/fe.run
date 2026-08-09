import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "#site/content";
import { siteConfig, SITE_URL } from "@/lib/site";

const title = "전체 글";
const description = `${siteConfig.name}에 쓴 모든 글을 연도별로 모아둔 목록.`;
const canonical = "/posts";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: `${SITE_URL}${canonical}`,
    siteName: siteConfig.name,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function PostsArchivePage() {
  const published = posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 연도별로 묶는다. 홈은 최근 16편만 렌더하고 나머지는 클라이언트 페이지네이션이라
  // 크롤러가 볼 수 있는 <a> 가 없다. 이 페이지가 전체 글의 링크 진입점 역할을 한다.
  const byYear = new Map<number, typeof published>();
  for (const post of published) {
    const year = new Date(post.date).getFullYear();
    const bucket = byYear.get(year);
    if (bucket) bucket.push(post);
    else byYear.set(year, [post]);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  const pageUrl = `${SITE_URL}${canonical}`;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: pageUrl,
    inLanguage: "ko-KR",
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: SITE_URL },
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: published.length,
    itemListElement: published.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/posts/${post.slug}`,
      name: post.title,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: title, item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">모음</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">전체 글</h1>
          <p className="mt-2 text-secondary">{published.length}편</p>
        </header>

        <div className="flex flex-col gap-10">
          {years.map((year) => (
            <section key={year}>
              <h2 className="mb-3 text-sm font-semibold tabular-nums text-secondary">{year}</h2>
              <ul className="flex flex-col">
                {byYear.get(year)!.map((post) => (
                  <li key={post.slug} className="border-b border-border last:border-b-0">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="flex items-baseline gap-4 py-3 transition-colors hover:text-accent"
                    >
                      <time
                        dateTime={post.date}
                        className="shrink-0 text-xs tabular-nums text-secondary"
                      >
                        {formatDate(post.date)}
                      </time>
                      <span className="min-w-0 flex-1 text-[15px] leading-snug">{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
