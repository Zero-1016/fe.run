import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "#site/content";
import { siteConfig, SITE_URL } from "@/lib/site";

const title = "시리즈";
const description = `${siteConfig.name}의 시리즈 모음 — 연결된 글들을 한 줄로 따라 읽을 수 있어요.`;
const canonical = "/series";

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

type SeriesInfo = {
  name: string;
  count: number;
  latest: number;
  firstSlug: string;
};

export default function SeriesIndexPage() {
  const map = new Map<string, SeriesInfo>();
  for (const p of posts) {
    if (!p.published || !p.series) continue;
    const t = new Date(p.date).getTime();
    const existing = map.get(p.series);
    if (existing) {
      existing.count += 1;
      if (t > existing.latest) existing.latest = t;
      if ((p.seriesOrder ?? 0) <= 1) existing.firstSlug = p.slug;
    } else {
      map.set(p.series, {
        name: p.series,
        count: 1,
        latest: t,
        firstSlug: p.slug,
      });
    }
  }

  const entries = Array.from(map.values()).sort((a, b) => b.latest - a.latest);

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
    numberOfItems: entries.length,
    itemListElement: entries.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/series/${encodeURIComponent(s.name)}`,
      name: s.name,
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight">시리즈</h1>
          <p className="mt-2 text-secondary">{entries.length}개의 시리즈</p>
        </header>
        <div className="flex flex-col gap-1">
          {entries.map((s) => (
            <Link
              key={s.name}
              href={`/series/${encodeURIComponent(s.name)}`}
              className="group -mx-3 rounded-xl px-3 py-4 transition-colors hover:bg-card-hover"
            >
              <article className="flex items-center justify-between gap-4">
                <h2 className="font-semibold tracking-tight group-hover:text-accent">{s.name}</h2>
                <span className="shrink-0 text-sm tabular-nums text-secondary">{s.count}편</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
