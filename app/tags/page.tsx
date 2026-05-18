import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "#site/content";
import { siteConfig, SITE_URL } from "@/lib/site";

const title = "태그";
const description = `${siteConfig.name}의 모든 태그 모음.`;
const canonical = "/tags";

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

export default function TagsIndexPage() {
  const counts = new Map<string, number>();
  for (const p of posts) {
    if (!p.published) continue;
    for (const tag of p.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  const entries = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">모음</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">태그</h1>
          <p className="mt-2 text-secondary">{entries.length}개의 태그</p>
        </header>
        <div className="flex flex-wrap gap-2">
          {entries.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm leading-none text-secondary transition-colors hover:border-accent/30 hover:text-accent dark:bg-[#111113] dark:text-white"
            >
              <span className="leading-none">#{tag}</span>
              <span className="text-xs leading-none tabular-nums">{count}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
